import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || session.user.userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { requestId, action, requestIds } = await request.json();

    // التحقق من صحة البيانات
    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'إجراء غير صحيح' }, { status: 400 });
    }

    // للإجراءات الفردية
    if (requestId && !requestIds) {
      return handleSingleRequest(requestId, action, session.user.email);
    }

    // للإجراءات الجماعية
    if (requestIds && Array.isArray(requestIds) && requestIds.length > 0) {
      return handleMultipleRequests(requestIds, action, session.user.email);
    }

    return NextResponse.json({ error: 'بيانات الطلب غير صحيحة' }, { status: 400 });

  } catch (error) {
    console.error('خطأ في إدارة طلب الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في معالجة الطلب' }, { status: 500 });
  }
}

async function handleSingleRequest(requestId: string, action: string, teacherEmail: string) {
  // البحث عن معرف المعلمة
  const teacher = await db.user.findUnique({
    where: { userEmail: teacherEmail },
    select: { id: true }
  });

  if (!teacher) {
    return NextResponse.json({ error: 'معرف المعلمة غير موجود' }, { status: 404 });
  }

  // التحقق من أن الطلب ينتمي لحلقة من حلقات المعلمة
  const enrollmentRequest = await db.enrollmentRequest.findUnique({
    where: { id: requestId },
    include: {
      course: {
        select: {
          id: true,
          courseName: true,
          teacherId: true,
          maxStudents: true,
        }
      },
      student: {
        select: {
          id: true,
          studentName: true,
        }
      }
    }
  });

  if (!enrollmentRequest) {
    return NextResponse.json({ error: 'طلب الانضمام غير موجود' }, { status: 404 });
  }

  if (enrollmentRequest.course.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'غير مصرح لك بإدارة هذا الطلب' }, { status: 403 });
  }

  if (enrollmentRequest.status !== 'PENDING') {
    return NextResponse.json({ error: 'تم التعامل مع هذا الطلب سابقاً' }, { status: 400 });
  }

  // في حالة القبول، التحقق من عدم تجاوز الحد الأقصى
  if (action === 'accept') {
    const currentEnrollments = await db.enrollment.count({
      where: {
        courseId: enrollmentRequest.course.id,
        isActive: true,
      }
    });

    if (currentEnrollments >= enrollmentRequest.course.maxStudents) {
      return NextResponse.json({ error: 'الحلقة مكتملة العدد' }, { status: 400 });
    }

    // تحديث حالة الطلب وإنشاء تسجيل
    const [updatedRequest, newEnrollment] = await db.$transaction([
      db.enrollmentRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' }
      }),
      db.enrollment.create({
        data: {
          studentId: enrollmentRequest.student.id,
          courseId: enrollmentRequest.course.id,
        }
      })
    ]);

    return NextResponse.json({
      message: `تم قبول طلب الطالبة ${enrollmentRequest.student.studentName}`,
      request: updatedRequest,
      enrollment: newEnrollment
    });

  } else {
    // رفض الطلب
    const updatedRequest = await db.enrollmentRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    return NextResponse.json({
      message: `تم رفض طلب الطالبة ${enrollmentRequest.student.studentName}`,
      request: updatedRequest
    });
  }
}

async function handleMultipleRequests(requestIds: string[], action: string, teacherEmail: string) {
  // البحث عن معرف المعلمة
  const teacher = await db.user.findUnique({
    where: { userEmail: teacherEmail },
    select: { id: true }
  });

  if (!teacher) {
    return NextResponse.json({ error: 'معرف المعلمة غير موجود' }, { status: 404 });
  }

  // جلب كل الطلبات المحددة والتحقق منها
  const enrollmentRequests = await db.enrollmentRequest.findMany({
    where: {
      id: { in: requestIds },
      status: 'PENDING',
      course: {
        teacherId: teacher.id,
      }
    },
    include: {
      course: {
        select: {
          id: true,
          courseName: true,
          maxStudents: true,
        }
      },
      student: {
        select: {
          id: true,
          studentName: true,
        }
      }
    }
  });

  if (enrollmentRequests.length === 0) {
    return NextResponse.json({ error: 'لا توجد طلبات صحيحة للمعالجة' }, { status: 400 });
  }

  const results = [];
  const errors = [];

  for (const request of enrollmentRequests) {
    try {
      if (action === 'accept') {
        // التحقق من عدم تجاوز الحد الأقصى لكل حلقة
        const currentEnrollments = await db.enrollment.count({
          where: {
            courseId: request.course.id,
            isActive: true,
          }
        });

        if (currentEnrollments >= request.course.maxStudents) {
          errors.push(`الحلقة ${request.course.courseName} مكتملة العدد - لا يمكن قبول ${request.student.studentName}`);
          continue;
        }

        // قبول الطلب وإنشاء تسجيل
        const [updatedRequest, newEnrollment] = await db.$transaction([
          db.enrollmentRequest.update({
            where: { id: request.id },
            data: { status: 'ACCEPTED' }
          }),
          db.enrollment.create({
            data: {
              studentId: request.student.id,
              courseId: request.course.id,
            }
          })
        ]);

        results.push({
          action: 'accepted',
          studentName: request.student.studentName,
          courseName: request.course.courseName,
          request: updatedRequest,
          enrollment: newEnrollment
        });

      } else {
        // رفض الطلب
        const updatedRequest = await db.enrollmentRequest.update({
          where: { id: request.id },
          data: { status: 'REJECTED' }
        });

        results.push({
          action: 'rejected',
          studentName: request.student.studentName,
          courseName: request.course.courseName,
          request: updatedRequest
        });
      }
    } catch (error) {
      errors.push(`خطأ في معالجة طلب ${request.student.studentName}: ${error}`);
    }
  }

  return NextResponse.json({
    message: `تم معالجة ${results.length} طلب بنجاح${errors.length > 0 ? ` مع ${errors.length} خطأ` : ''}`,
    results,
    errors,
    summary: {
      processed: results.length,
      errors: errors.length,
      total: requestIds.length
    }
  });
}