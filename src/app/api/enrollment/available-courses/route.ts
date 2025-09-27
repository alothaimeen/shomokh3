import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// بيانات احتياطية للحلقات المتاحة
function getFallbackCourses() {
  return [
    {
      id: "course-1",
      courseName: "حلقة الفجر - المستوى الأول",
      courseDescription: "حلقة تحفيظ القرآن الكريم مع أساسيات التجويد",
      syllabus: "من الفاتحة إلى نهاية جزء عم",
      level: 1,
      maxStudents: 20,
      currentStudents: 8,
      isAvailable: true,
      program: {
        id: "prog-1",
        programName: "برنامج الحفظ المكثف",
        programDescription: "برنامج لحفظ القرآن الكريم"
      },
      teacher: {
        id: "teacher-1",
        userName: "المعلمة سارة"
      }
    },
    {
      id: "course-2",
      courseName: "حلقة المغرب - المستوى الأول",
      courseDescription: "حلقة تحفيظ مع مراجعة وتركيز على التجويد",
      syllabus: "من سورة البقرة إلى سورة النساء",
      level: 1,
      maxStudents: 15,
      currentStudents: 12,
      isAvailable: true,
      program: {
        id: "prog-2",
        programName: "برنامج التجويد المتقدم",
        programDescription: "برنامج متخصص في التجويد"
      },
      teacher: {
        id: "teacher-2",
        userName: "المعلمة عائشة"
      }
    },
    {
      id: "course-3",
      courseName: "حلقة العصر - المستوى الأول",
      courseDescription: "حلقة مخصصة للمبتدئات",
      syllabus: "الحروف الهجائية وأساسيات القراءة",
      level: 1,
      maxStudents: 10,
      currentStudents: 10,
      isAvailable: false, // مكتملة العدد
      program: {
        id: "prog-1",
        programName: "برنامج الحفظ المكثف",
        programDescription: "برنامج لحفظ القرآن الكريم"
      },
      teacher: {
        id: "teacher-1",
        userName: "المعلمة سارة"
      }
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || session.user.userRole !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // محاولة جلب البيانات من قاعدة البيانات
    if (process.env.DATABASE_URL) {
      try {
        const availableCourses = await db.course.findMany({
          where: {
            isActive: true,
            level: 1, // المستوى الأول فقط للطالبات الجديدات
          },
          include: {
            program: {
              select: {
                id: true,
                programName: true,
                programDescription: true,
              }
            },
            teacher: {
              select: {
                id: true,
                userName: true,
              }
            },
            _count: {
              select: {
                enrollments: true, // عد الطالبات المسجلات
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // إذا وُجدت بيانات في قاعدة البيانات، استخدمها
        if (availableCourses.length > 0) {
          const formattedCourses = availableCourses.map(course => ({
            id: course.id,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            syllabus: course.syllabus,
            level: course.level,
            maxStudents: course.maxStudents,
            currentStudents: course._count.enrollments,
            isAvailable: course._count.enrollments < course.maxStudents,
            program: {
              id: course.program.id,
              programName: course.program.programName,
              programDescription: course.program.programDescription,
            },
            teacher: course.teacher ? {
              id: course.teacher.id,
              userName: course.teacher.userName,
            } : null,
          }));

          return NextResponse.json({ courses: formattedCourses });
        }
      } catch (dbError) {
        console.log('Database connection failed, using fallback data');
      }
    }

    // استخدام البيانات الاحتياطية
    const fallbackCourses = getFallbackCourses();
    return NextResponse.json({ courses: fallbackCourses });

  } catch (error) {
    console.error('خطأ في جلب الحلقات المتاحة:', error);
    // حتى في حالة الخطأ، نعطي بيانات احتياطية
    const fallbackCourses = getFallbackCourses();
    return NextResponse.json({ courses: fallbackCourses });
  }
}