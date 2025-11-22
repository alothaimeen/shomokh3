import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    // الحصول على معلومات المستخدم
    const user = await db.user.findUnique({
      where: { userEmail: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // التحقق من أن المستخدم طالبة
    if (user.userRole !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح - خاص بالطالبات فقط' }, { status: 403 });
    }

    // الحصول على الطالبة من خلال userId (الربط الصحيح)
    const student = await db.student.findUnique({
      where: { 
        userId: user.id
      }
    });

    if (!student) {
      return NextResponse.json({ 
        enrollments: [],
        message: 'لم يتم إنشاء ملف طالبة بعد'
      });
    }

    // جلب الحلقات المسجلة فيها الطالبة
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: student.id,
        isActive: true
      },
      include: {
        course: {
          include: {
            program: true,
            teacher: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

    const formattedEnrollments = enrollments.map(enrollment => ({
      id: enrollment.course.id,
      courseName: enrollment.course.courseName,
      programName: enrollment.course.program.programName,
      level: enrollment.course.level,
      teacherName: enrollment.course.teacher?.userName || 'غير محددة'
    }));

    return NextResponse.json({ enrollments: formattedEnrollments });

  } catch (error) {
    console.error('خطأ في جلب التسجيلات:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
