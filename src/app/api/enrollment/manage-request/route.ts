import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
      return handleSingleRequest(requestId, action);
    }

    // للإجراءات الجماعية
    if (requestIds && Array.isArray(requestIds) && requestIds.length > 0) {
      return handleMultipleRequests(requestIds, action);
    }

    return NextResponse.json({ error: 'بيانات الطلب غير صحيحة' }, { status: 400 });

  } catch (error) {
    console.error('خطأ في إدارة طلب الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في معالجة الطلب' }, { status: 500 });
  }
}

async function handleSingleRequest(requestId: string, action: string) {
  // إرجاع استجابة نجاح مع بيانات اختبار
  const studentName = requestId === 'req-1' ? 'الطالبة فاطمة أحمد' :
                      requestId === 'req-2' ? 'الطالبة عائشة محمد' :
                      requestId === 'req-3' ? 'الطالبة خديجة علي' : 'طالبة اختبار';

  const courseName = 'حلقة الفجر'; // افتراضي

  if (action === 'accept') {
    const sampleResponse = {
      message: `تم قبول طلب ${studentName}`,
      request: {
        id: requestId,
        status: 'ACCEPTED',
        updatedAt: new Date(),
      },
      enrollment: {
        id: `enroll-${Date.now()}`,
        studentId: `student-${requestId.split('-')[1]}`,
        courseId: 'course-1',
        enrolledAt: new Date(),
        isActive: true,
      }
    };

    return NextResponse.json(sampleResponse);
  } else {
    const sampleResponse = {
      message: `تم رفض طلب ${studentName}`,
      request: {
        id: requestId,
        status: 'REJECTED',
        updatedAt: new Date(),
      }
    };

    return NextResponse.json(sampleResponse);
  }
}

async function handleMultipleRequests(requestIds: string[], action: string) {
  const results = [];

  for (const requestId of requestIds) {
    const studentName = requestId === 'req-1' ? 'الطالبة فاطمة أحمد' :
                        requestId === 'req-2' ? 'الطالبة عائشة محمد' :
                        requestId === 'req-3' ? 'الطالبة خديجة علي' : 'طالبة اختبار';

    const courseName = 'حلقة الفجر';

    if (action === 'accept') {
      results.push({
        action: 'accepted',
        studentName,
        courseName,
        request: {
          id: requestId,
          status: 'ACCEPTED',
          updatedAt: new Date(),
        },
        enrollment: {
          id: `enroll-${Date.now()}-${requestId}`,
          studentId: `student-${requestId.split('-')[1]}`,
          courseId: 'course-1',
          enrolledAt: new Date(),
          isActive: true,
        }
      });
    } else {
      results.push({
        action: 'rejected',
        studentName,
        courseName,
        request: {
          id: requestId,
          status: 'REJECTED',
          updatedAt: new Date(),
        }
      });
    }
  }

  return NextResponse.json({
    message: `تم معالجة ${results.length} طلب بنجاح`,
    results,
    errors: [],
    summary: {
      processed: results.length,
      errors: 0,
      total: requestIds.length
    }
  });
}