import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkCourseOwnership } from '@/lib/course-ownership';

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
      return handleSingleRequest(requestId, action, session.user.id, session.user.userRole);
    }

    // للإجراءات الجماعية
    if (requestIds && Array.isArray(requestIds) && requestIds.length > 0) {
      return handleMultipleRequests(requestIds, action, session.user.id, session.user.userRole);
    }

    return NextResponse.json({ error: 'بيانات الطلب غير صحيحة' }, { status: 400 });

  } catch (error) {
    console.error('خطأ في إدارة طلب الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في معالجة الطلب' }, { status: 500 });
  }
}

async function handleSingleRequest(requestId: string, action: string, userId: string, userRole: string) {
  // البحث عن الطلب
  const enrollmentRequest = await db.enrollmentRequest.findUnique({
    where: { id: requestId },
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
          maxStudents: true,
          teacherId: true,
          _count: {
            select: {
              enrollments: true,
            }
          }
        }
      }
    }
  });

  if (!enrollmentRequest) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
  }

  // التحقق من الصلاحيات - التحقق من ملكية الحلقة
  const isAuthorized = await checkCourseOwnership(userId, enrollmentRequest.course.id, userRole);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'غير مصرح - لا يمكنك إدارة طلبات هذه الحلقة' }, { status: 403 });
  }

  if (enrollmentRequest.status !== 'PENDING') {
    return NextResponse.json({ error: 'الطلب تم معالجته مسبقاً' }, { status: 400 });
  }

  if (action === 'accept') {
    // التحقق من توفر مقاعد في الحلقة
    if (enrollmentRequest.course._count.enrollments >= enrollmentRequest.course.maxStudents) {
      return NextResponse.json({ error: 'الحلقة مكتملة العدد' }, { status: 400 });
    }

    // تحديث حالة الطلب وإنشاء التسجيل في transaction واحدة
    const result = await db.$transaction(async (tx) => {
      // تحديث حالة الطلب
      const updatedRequest = await tx.enrollmentRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      // إنشاء التسجيل
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: enrollmentRequest.student.id,
          courseId: enrollmentRequest.course.id,
        }
      });

      return { updatedRequest, enrollment };
    });

    return NextResponse.json({
      message: `تم قبول طلب ${enrollmentRequest.student.studentName}`,
      request: {
        id: result.updatedRequest.id,
        status: result.updatedRequest.status,
        updatedAt: result.updatedRequest.updatedAt,
      },
      enrollment: {
        id: result.enrollment.id,
        studentId: result.enrollment.studentId,
        courseId: result.enrollment.courseId,
        enrolledAt: result.enrollment.enrolledAt,
        isActive: result.enrollment.isActive,
      }
    });

  } else { // reject
    const updatedRequest = await db.enrollmentRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({
      message: `تم رفض طلب ${enrollmentRequest.student.studentName}`,
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        updatedAt: updatedRequest.updatedAt,
      }
    });
  }
}

async function handleMultipleRequests(requestIds: string[], action: string, userId: string, userRole: string) {
  const results = [];
  const errors = [];

  for (const requestId of requestIds) {
    try {
      const response = await handleSingleRequest(requestId, action, userId, userRole);
      const responseData = await response.json();

      if (response.ok) {
        results.push({
          requestId,
          action: action === 'accept' ? 'accepted' : 'rejected',
          ...responseData
        });
      } else {
        errors.push({
          requestId,
          error: responseData.error
        });
      }
    } catch (error) {
      errors.push({
        requestId,
        error: 'خطأ في معالجة الطلب'
      });
    }
  }

  return NextResponse.json({
    message: `تم معالجة ${results.length} طلب بنجاح`,
    results,
    errors,
    summary: {
      processed: results.length,
      errors: errors.length,
      total: requestIds.length
    }
  });
}
