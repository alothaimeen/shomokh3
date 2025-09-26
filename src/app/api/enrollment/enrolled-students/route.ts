import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || !['TEACHER', 'ADMIN', 'MANAGER'].includes(session.user.userRole)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // للمدير والمدير الأكاديمي: عرض جميع التسجيلات
    // للمعلمة: عرض تسجيلات حلقاتها فقط
    let whereCondition: any = {
      isActive: true,
    };

    if (session.user.userRole === 'TEACHER') {
      // البحث عن معرف المعلمة
      const teacher = await db.user.findUnique({
        where: { userEmail: session.user.email },
        select: { id: true }
      });

      if (!teacher) {
        return NextResponse.json({ error: 'معرف المعلمة غير موجود' }, { status: 404 });
      }

      whereCondition = {
        ...whereCondition,
        course: {
          teacherId: teacher.id,
        }
      };
    }

    // جلب الطالبات المسجلات
    const enrolledStudents = await db.enrollment.findMany({
      where: whereCondition,
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
                id: true,
                programName: true,
              }
            },
            teacher: {
              select: {
                id: true,
                userName: true,
              }
            }
          }
        }
      },
      orderBy: [
        { course: { courseName: 'asc' } },
        { student: { studentName: 'asc' } }
      ]
    });

    // تنسيق البيانات
    const formattedEnrollments = enrolledStudents.map(enrollment => ({
      id: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      student: {
        id: enrollment.student.id,
        studentNumber: enrollment.student.studentNumber,
        studentName: enrollment.student.studentName,
        studentPhone: enrollment.student.studentPhone,
        qualification: enrollment.student.qualification,
        nationality: enrollment.student.nationality,
        memorizedAmount: enrollment.student.memorizedAmount,
        paymentStatus: enrollment.student.paymentStatus,
        memorizationPlan: enrollment.student.memorizationPlan,
      },
      course: {
        id: enrollment.course.id,
        courseName: enrollment.course.courseName,
        level: enrollment.course.level,
        maxStudents: enrollment.course.maxStudents,
        programName: enrollment.course.program.programName,
        teacherName: enrollment.course.teacher?.userName || 'غير محدد',
      }
    }));

    // تجميع حسب الحلقة
    const enrollmentsByCourse = formattedEnrollments.reduce((acc, enrollment) => {
      const courseId = enrollment.course.id;
      if (!acc[courseId]) {
        acc[courseId] = {
          course: enrollment.course,
          students: [],
          studentsCount: 0,
        };
      }
      acc[courseId].students.push(enrollment);
      acc[courseId].studentsCount++;
      return acc;
    }, {} as Record<string, any>);

    // تحويل لمصفوفة
    const coursesList = Object.values(enrollmentsByCourse);

    return NextResponse.json({
      enrollments: formattedEnrollments,
      enrollmentsByCourse: coursesList,
      summary: {
        totalEnrollments: formattedEnrollments.length,
        totalCourses: coursesList.length,
        averageStudentsPerCourse: coursesList.length > 0
          ? Math.round(formattedEnrollments.length / coursesList.length)
          : 0,
      }
    });

  } catch (error) {
    console.error('خطأ في جلب الطالبات المسجلات:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}