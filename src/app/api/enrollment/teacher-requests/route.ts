import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || session.user.userRole !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // إرجاع بيانات اختبار لطلبات الانضمام
    const sampleRequests = [
      {
        id: 'req-1',
        status: 'PENDING',
        message: 'أرغب في الانضمام لحلقة الحفظ',
        createdAt: new Date('2025-09-25T10:30:00Z'),
        student: {
          id: 'student-1',
          studentNumber: 1001,
          studentName: 'الطالبة فاطمة أحمد',
          studentPhone: '0501234567',
          qualification: 'ثانوية عامة',
          nationality: 'سعودية',
          memorizedAmount: '5 أجزاء',
          paymentStatus: 'PAID',
        },
        course: {
          id: 'course-1',
          courseName: 'حلقة الفجر',
          programName: 'برنامج الحفظ المكثف',
        }
      },
      {
        id: 'req-2',
        status: 'PENDING',
        message: 'أرغب في الانضمام للتجويد المتقدم',
        createdAt: new Date('2025-09-26T14:15:00Z'),
        student: {
          id: 'student-2',
          studentNumber: 1002,
          studentName: 'الطالبة عائشة محمد',
          studentPhone: '0507654321',
          qualification: 'بكالوريوس',
          nationality: 'مصرية',
          memorizedAmount: '10 أجزاء',
          paymentStatus: 'PARTIAL',
        },
        course: {
          id: 'course-2',
          courseName: 'حلقة المغرب',
          programName: 'برنامج التجويد المتقدم',
        }
      },
      {
        id: 'req-3',
        status: 'ACCEPTED',
        message: 'طلب انضمام للمراجعة',
        createdAt: new Date('2025-09-24T09:00:00Z'),
        student: {
          id: 'student-3',
          studentNumber: 1003,
          studentName: 'الطالبة خديجة علي',
          studentPhone: '0555555555',
          qualification: 'ماجستير',
          nationality: 'سعودية',
          memorizedAmount: '30 جزء',
          paymentStatus: 'PAID',
        },
        course: {
          id: 'course-1',
          courseName: 'حلقة الفجر',
          programName: 'برنامج الحفظ المكثف',
        }
      },
      {
        id: 'req-4',
        status: 'REJECTED',
        message: 'أرغب في الانضمام',
        createdAt: new Date('2025-09-23T16:45:00Z'),
        student: {
          id: 'student-4',
          studentNumber: 1004,
          studentName: 'الطالبة زينب حسن',
          studentPhone: '0509876543',
          qualification: 'إعدادية',
          nationality: 'أردنية',
          memorizedAmount: '2 أجزاء',
          paymentStatus: 'UNPAID',
        },
        course: {
          id: 'course-1',
          courseName: 'حلقة الفجر',
          programName: 'برنامج الحفظ المكثف',
        }
      }
    ];

    // تجميع حسب الحالة
    const requestsByStatus = {
      pending: sampleRequests.filter(req => req.status === 'PENDING'),
      accepted: sampleRequests.filter(req => req.status === 'ACCEPTED'),
      rejected: sampleRequests.filter(req => req.status === 'REJECTED'),
    };

    return NextResponse.json({
      requests: sampleRequests,
      requestsByStatus,
      counts: {
        pending: requestsByStatus.pending.length,
        accepted: requestsByStatus.accepted.length,
        rejected: requestsByStatus.rejected.length,
        total: sampleRequests.length,
      }
    });

  } catch (error) {
    console.error('خطأ في جلب طلبات الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}