import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    let courses;

    if (session.user.role === 'TEACHER') {
      // للمعلمة: جلب حلقاتها فقط
      courses = await db.course.findMany({
        where: {
          isActive: true,
          teacherId: session.user.id
        },
        select: {
          id: true,
          courseName: true,
          level: true,
          program: {
            select: {
              programName: true
            }
          }
        },
        orderBy: {
          courseName: 'asc'
        }
      });
    } else {
      // للمديرة: جلب جميع الحلقات
      courses = await db.course.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          courseName: true,
          level: true,
          program: {
            select: {
              programName: true
            }
          },
          teacher: {
            select: {
              userName: true
            }
          }
        },
        orderBy: {
          courseName: 'asc'
        }
      });
    }

    // تنسيق البيانات - إرجاع array مباشرة
    const formattedCourses = courses.map((course: any) => ({
      id: course.id,
      courseName: course.courseName,
      level: course.level,
      programName: course.program?.programName,
      teacherName: course.teacher?.userName
    }));

    return NextResponse.json(formattedCourses);

  } catch (error) {
    console.error('خطأ في جلب الحلقات:', error);
    return NextResponse.json({ error: 'خطأ في جلب الحلقات' }, { status: 500 });
  }
}
