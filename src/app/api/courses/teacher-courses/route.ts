import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // جلب جميع الحلقات للمعلمة
    let courses;
    
    if (session.user.role === 'TEACHER') {
      // للمعلمة: جلب حلقاتها فقط
      courses = await db.course.findMany({
        where: {
          isActive: true,
          teacherId: session.user.id
        },
        include: {
          program: {
            select: {
              programName: true
            }
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: {
          courseName: 'asc'
        }
      });
    } else {
      // للمدير: جلب جميع الحلقات
      courses = await db.course.findMany({
        where: {
          isActive: true
        },
        include: {
          program: {
            select: {
              programName: true
            }
          },
          teacher: {
            select: {
              userName: true
            }
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: {
          courseName: 'asc'
        }
      });
    }

    // تنسيق البيانات
    const formattedCourses = courses.map((course: any) => ({
      id: course.id,
      courseName: course.courseName,
      programName: course.program.programName,
      level: course.level,
      studentsCount: course._count.enrollments
    }));

    return NextResponse.json({ courses: formattedCourses });

  } catch (error) {
    console.error('خطأ في جلب الحلقات:', error);
    return NextResponse.json({ error: 'خطأ في جلب الحلقات' }, { status: 500 });
  }
}
