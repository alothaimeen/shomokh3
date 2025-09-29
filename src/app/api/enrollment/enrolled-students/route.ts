import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    console.log('بدء استدعاء API للطالبات المسجلات');
    const session = await getServerSession(authOptions);
    console.log('الجلسة:', session ? 'موجودة' : 'غير موجودة');

    if (!session || !['TEACHER', 'ADMIN'].includes(session.user.userRole)) {
      console.log('خطأ في الصلاحية - الدور:', session?.user?.userRole);
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    console.log('الصلاحية صحيحة - الدور:', session.user.userRole);

    // استخراج courseId من query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    console.log('جلب البيانات من قاعدة البيانات');

    // بناء شرط WHERE حسب دور المستخدم
    let whereCondition: any = {};
    if (session.user.userRole === 'TEACHER') {
      whereCondition = {
        course: {
          teacher: {
            userEmail: session.user.email,
          }
        }
      };
    }
    // للـ ADMIN، جلب جميع التسجيلات (بدون شرط)

    // إضافة فلتر الحلقة إذا تم تحديدها
    if (courseId) {
      whereCondition.courseId = courseId;
    }

    const enrollments = await db.enrollment.findMany({
      where: {
        isActive: true,
        ...whereCondition
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
            memorizationPlan: true,
          }
        },
        course: {
          select: {
            id: true,
            courseName: true,
            level: true,
            maxStudents: true,
            program: {
              select: {
                programName: true,
              }
            },
            teacher: {
              select: {
                userName: true,
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

    console.log(`تم جلب ${enrollments.length} تسجيل من قاعدة البيانات`);

    // تجميع التسجيلات حسب الحلقة
    const enrollmentsByCourse = enrollments.reduce((acc: any[], enrollment: any) => {
      const courseId = enrollment.course.id;
      let courseGroup = acc.find(group => group.course.id === courseId);

      if (!courseGroup) {
        courseGroup = {
          course: {
            id: enrollment.course.id,
            courseName: enrollment.course.courseName,
            level: enrollment.course.level,
            maxStudents: enrollment.course.maxStudents,
            programName: enrollment.course.program.programName,
            teacherName: enrollment.course.teacher?.userName || 'غير محدد',
          },
          students: [],
          studentsCount: 0
        };
        acc.push(courseGroup);
      }

      courseGroup.students.push({
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        student: enrollment.student,
        course: {
          id: enrollment.course.id,
          courseName: enrollment.course.courseName,
          level: enrollment.course.level,
          maxStudents: enrollment.course.maxStudents,
          programName: enrollment.course.program.programName,
          teacherName: enrollment.course.teacher?.userName || 'غير محدد',
        }
      });
      courseGroup.studentsCount = courseGroup.students.length;

      return acc;
    }, []);

    const summary = {
      totalEnrollments: enrollments.length,
      totalCourses: enrollmentsByCourse.length,
      averageStudentsPerCourse: enrollmentsByCourse.length > 0
        ? Math.round(enrollments.length / enrollmentsByCourse.length * 100) / 100
        : 0,
    };

    return NextResponse.json({
      enrollments,
      enrollmentsByCourse,
      summary
    });

  } catch (error) {
    console.error('خطأ في جلب الطالبات المسجلات:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}