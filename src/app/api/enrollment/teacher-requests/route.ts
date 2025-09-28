import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || session.user.userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // استخراج courseId من query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // بناء شرط WHERE
    let whereCondition: any = {
      course: {
        teacher: {
          userEmail: session.user.email,
        }
      }
    };

    // إضافة فلتر الحلقة إذا تم تحديدها
    if (courseId) {
      whereCondition.courseId = courseId;
    }

    // جلب الطلبات من قاعدة البيانات للمعلمة الحالية
    const enrollmentRequests = await db.enrollmentRequest.findMany({
      where: whereCondition,
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            studentName: true,
            studentPhone: true,
            qualification: true,
            nationality: true,
            memorizedAmount: true,
            paymentStatus: true,
          }
        },
        course: {
          select: {
            id: true,
            courseName: true,
            program: {
              select: {
                programName: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // تجميع حسب الحالة
    const requestsByStatus = {
      pending: enrollmentRequests.filter(req => req.status === 'PENDING'),
      accepted: enrollmentRequests.filter(req => req.status === 'ACCEPTED'),
      rejected: enrollmentRequests.filter(req => req.status === 'REJECTED'),
    };

    return NextResponse.json({
      requests: enrollmentRequests,
      requestsByStatus,
      counts: {
        pending: requestsByStatus.pending.length,
        accepted: requestsByStatus.accepted.length,
        rejected: requestsByStatus.rejected.length,
        total: enrollmentRequests.length,
      }
    });

  } catch (error) {
    console.error('خطأ في جلب طلبات الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}