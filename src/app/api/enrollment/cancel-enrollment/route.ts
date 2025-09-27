import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || !['TEACHER', 'ADMIN', 'MANAGER'].includes(session.user.userRole)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { enrollmentId, enrollmentIds } = await request.json();

    // للإلغاء الفردي
    if (enrollmentId && !enrollmentIds) {
      return handleSingleCancellation(enrollmentId, session.user.email, session.user.userRole);
    }

    // للإلغاء الجماعي
    if (enrollmentIds && Array.isArray(enrollmentIds) && enrollmentIds.length > 0) {
      return handleMultipleCancellations(enrollmentIds, session.user.email, session.user.userRole);
    }

    return NextResponse.json({ error: 'بيانات الطلب غير صحيحة' }, { status: 400 });

  } catch (error) {
    console.error('خطأ في إلغاء التسجيل:', error);
    return NextResponse.json({ error: 'خطأ في معالجة الطلب' }, { status: 500 });
  }
}

async function handleSingleCancellation(enrollmentId: string, userEmail: string, userRole: string) {
  // التحقق من وجود التسجيل
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: {
        select: {
          id: true,
          studentName: true,
        }
      },
      course: {
        select: {
          id: true,
          courseName: true,
          teacherId: true,
        }
      }
    }
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'التسجيل غير موجود' }, { status: 404 });
  }

  if (!enrollment.isActive) {
    return NextResponse.json({ error: 'هذا التسجيل ملغي مسبقاً' }, { status: 400 });
  }

  // للمعلمة: التحقق من أن الحلقة تخصها
  if (userRole === 'TEACHER') {
    const teacher = await db.user.findUnique({
      where: { userEmail },
      select: { id: true }
    });

    if (!teacher) {
      // إذا لم يكن المستخدم موجود في قاعدة البيانات، نسمح بالعملية (للاختبار)
      console.log('المعلمة غير موجودة في قاعدة البيانات - وضع الاختبار');
    } else if (enrollment.course.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'غير مصرح لك بإلغاء هذا التسجيل' }, { status: 403 });
    }
  }

  // إلغاء التسجيل (تعطيل بدلاً من حذف)
  const cancelledEnrollment = await db.enrollment.update({
    where: { id: enrollmentId },
    data: { isActive: false }
  });

  return NextResponse.json({
    message: `تم إلغاء تسجيل الطالبة ${enrollment.student.studentName} من حلقة ${enrollment.course.courseName}`,
    enrollment: cancelledEnrollment
  });
}

async function handleMultipleCancellations(enrollmentIds: string[], userEmail: string, userRole: string) {
  // للمعلمة: التحقق من الصلاحيات
  let whereCondition: any = {
    id: { in: enrollmentIds },
    isActive: true,
  };

  if (userRole === 'TEACHER') {
    const teacher = await db.user.findUnique({
      where: { userEmail },
      select: { id: true }
    });

    if (!teacher) {
      // إذا لم يكن المستخدم موجود في قاعدة البيانات، نسمح بالعملية (للاختبار)
      console.log('المعلمة غير موجودة في قاعدة البيانات - وضع الاختبار');
    } else {
      whereCondition = {
        ...whereCondition,
        course: {
          teacherId: teacher.id,
        }
      };
    }
  }

  // جلب التسجيلات المحددة والتحقق منها
  const enrollments = await db.enrollment.findMany({
    where: whereCondition,
    include: {
      student: {
        select: {
          id: true,
          studentName: true,
        }
      },
      course: {
        select: {
          id: true,
          courseName: true,
        }
      }
    }
  });

  if (enrollments.length === 0) {
    return NextResponse.json({ error: 'لا توجد تسجيلات صحيحة للإلغاء' }, { status: 400 });
  }

  const results = [];
  const errors = [];

  // إلغاء التسجيلات واحداً تلو الآخر
  for (const enrollment of enrollments) {
    try {
      const cancelledEnrollment = await db.enrollment.update({
        where: { id: enrollment.id },
        data: { isActive: false }
      });

      results.push({
        enrollmentId: enrollment.id,
        studentName: enrollment.student.studentName,
        courseName: enrollment.course.courseName,
        cancelled: true
      });
    } catch (error) {
      errors.push(`خطأ في إلغاء تسجيل ${enrollment.student.studentName}: ${error}`);
    }
  }

  return NextResponse.json({
    message: `تم إلغاء ${results.length} تسجيل بنجاح${errors.length > 0 ? ` مع ${errors.length} خطأ` : ''}`,
    results,
    errors,
    summary: {
      cancelled: results.length,
      errors: errors.length,
      total: enrollmentIds.length
    }
  });
}