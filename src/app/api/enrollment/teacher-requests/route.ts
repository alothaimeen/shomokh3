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

    // البحث عن معرف المعلمة من جدول المستخدمين
    const teacher = await db.user.findUnique({
      where: { userEmail: session.user.email },
      select: { id: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'معرف المعلمة غير موجود' }, { status: 404 });
    }

    // جلب طلبات الانضمام للحلقات التي تدرّسها المعلمة
    const enrollmentRequests = await db.enrollmentRequest.findMany({
      where: {
        course: {
          teacherId: teacher.id,
        }
      },
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

    // تنسيق البيانات
    const formattedRequests = enrollmentRequests.map(request => ({
      id: request.id,
      status: request.status,
      message: request.message,
      createdAt: request.createdAt,
      student: {
        id: request.student.id,
        studentNumber: request.student.studentNumber,
        studentName: request.student.studentName,
        studentPhone: request.student.studentPhone,
        qualification: request.student.qualification,
        nationality: request.student.nationality,
        memorizedAmount: request.student.memorizedAmount,
        paymentStatus: request.student.paymentStatus,
      },
      course: {
        id: request.course.id,
        courseName: request.course.courseName,
        programName: request.course.program.programName,
      }
    }));

    // تجميع حسب الحالة
    const requestsByStatus = {
      pending: formattedRequests.filter(req => req.status === 'PENDING'),
      accepted: formattedRequests.filter(req => req.status === 'ACCEPTED'),
      rejected: formattedRequests.filter(req => req.status === 'REJECTED'),
    };

    return NextResponse.json({
      requests: formattedRequests,
      requestsByStatus,
      counts: {
        pending: requestsByStatus.pending.length,
        accepted: requestsByStatus.accepted.length,
        rejected: requestsByStatus.rejected.length,
        total: formattedRequests.length,
      }
    });

  } catch (error) {
    console.error('خطأ في جلب طلبات الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}