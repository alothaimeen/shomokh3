import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    // بناء شرط WHERE حسب دور المستخدم
    let whereCondition: any = {};
    let courseWhereCondition: any = { isActive: true };
    let enrollmentWhereCondition: any = { isActive: true };

    if (session.user.userRole === 'TEACHER') {
      // للمعلمة: البيانات المتعلقة بحلقاتها فقط
      courseWhereCondition = {
        ...courseWhereCondition,
        teacher: {
          userEmail: session.user.email || '',
        }
      };
      enrollmentWhereCondition = {
        ...enrollmentWhereCondition,
        course: {
          teacher: {
            userEmail: session.user.email || '',
          }
        }
      };
    }

    // جلب الإحصائيات
    const stats = await Promise.all([
      // إجمالي المستخدمين (للأدمن والمدير فقط)
      session.user.userRole === 'ADMIN' ? db.user.count() : Promise.resolve(0),

      // عدد البرامج
      session.user.userRole === 'TEACHER'
        ? db.program.count({
            where: {
              courses: {
                some: {
                  teacher: {
                    userEmail: session.user.email || '',
                  }
                }
              }
            }
          })
        : db.program.count(),

      // عدد الحلقات
      db.course.count({
        where: courseWhereCondition
      }),

      // عدد الطالبات المسجلات
      db.enrollment.count({
        where: enrollmentWhereCondition
      })
    ]);

    const [totalUsers, totalPrograms, totalCourses, totalStudents] = stats;

    return NextResponse.json({
      totalUsers,
      totalPrograms,
      totalCourses,
      totalStudents
    });

  } catch (error) {
    console.error('خطأ في الحصول على الإحصائيات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الحصول على الإحصائيات' },
      { status: 500 }
    );
  }
}
