import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || session.user.userRole !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { courseId, message } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'معرف الحلقة مطلوب' }, { status: 400 });
    }

    // التحقق من وجود الحلقة وأنها متاحة
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            enrollments: true,
          }
        }
      }
    });

    if (!course || !course.isActive) {
      return NextResponse.json({ error: 'الحلقة غير موجودة أو غير نشطة' }, { status: 400 });
    }

    if (course._count.enrollments >= course.maxStudents) {
      return NextResponse.json({ error: 'الحلقة مكتملة العدد' }, { status: 400 });
    }

    // البحث عن الطالبة المرتبطة بالمستخدم الحالي باستخدام userId
    console.log('🔍 Searching for student with userId:', session.user.id);

    let student = await db.student.findUnique({
      where: {
        userId: session.user.id
      }
    });

    console.log('✅ Student search result:', student ? `Found: ${student.studentName}` : 'Not found');

    // إذا لم نجد أي طالبة، ننشئ واحدة جديدة (fallback)
    if (!student) {
      console.log('🆕 Creating new student for user:', session.user.name);
      const nextSequenceNumber = await db.student.count() + 1;
      student = await db.student.create({
        data: {
          userId: session.user.id,
          studentNumber: nextSequenceNumber,
          studentName: session.user.name || 'طالبة جديدة',
          qualification: 'غير محدد',
          nationality: 'غير محدد',
          studentPhone: 'غير محدد',
          memorizedAmount: 'غير محدد',
          memorizationPlan: 'غير محدد',
        }
      });
    }

    // التحقق من وجود طلب سابق
    const existingRequest = await db.enrollmentRequest.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: courseId,
        }
      }
    });

    if (existingRequest) {
      return NextResponse.json({
        error: 'يوجد طلب انضمام سابق لهذه الحلقة',
        status: existingRequest.status
      }, { status: 400 });
    }

    // إنشاء طلب الانضمام
    const enrollmentRequest = await db.enrollmentRequest.create({
      data: {
        studentId: student.id,
        courseId: courseId,
        message: message || null,
        status: 'PENDING',
      },
      include: {
        course: {
          select: {
            courseName: true,
            program: {
              select: {
                programName: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'تم تقديم طلب الانضمام بنجاح',
      request: {
        id: enrollmentRequest.id,
        courseName: enrollmentRequest.course.courseName,
        programName: enrollmentRequest.course.program.programName,
        status: enrollmentRequest.status,
        createdAt: enrollmentRequest.createdAt,
      }
    });

  } catch (error) {
    console.error('خطأ في تقديم طلب الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في تقديم الطلب' }, { status: 500 });
  }
}
