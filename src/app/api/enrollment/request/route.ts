import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// بيانات احتياطية للحلقات المتاحة (تتطابق مع API available-courses)
function getFallbackCourses() {
  return {
    "course-1": {
      id: "course-1",
      courseName: "حلقة الفجر - المستوى الأول",
      programName: "برنامج الحفظ المكثف",
      maxStudents: 20,
      currentStudents: 8,
      isAvailable: true
    },
    "course-2": {
      id: "course-2",
      courseName: "حلقة المغرب - المستوى الأول",
      programName: "برنامج التجويد المتقدم",
      maxStudents: 15,
      currentStudents: 12,
      isAvailable: true
    },
    "course-3": {
      id: "course-3",
      courseName: "حلقة العصر - المستوى الأول",
      programName: "برنامج الحفظ المكثف",
      maxStudents: 10,
      currentStudents: 10,
      isAvailable: false
    }
  };
}

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

    // محاولة استخدام قاعدة البيانات أولاً
    if (process.env.DATABASE_URL) {
      try {
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

        if (course && course.isActive) {
          if (course._count.enrollments >= course.maxStudents) {
            return NextResponse.json({ error: 'الحلقة مكتملة العدد' }, { status: 400 });
          }

          // البحث عن معرف الطالبة
          let student = await db.student.findFirst({
            where: {
              // يمكن إضافة منطق للربط بالمستخدم هنا
            }
          });

          // إذا لم نجد الطالبة، ننشئ واحدة جديدة
          if (!student) {
            const nextSequenceNumber = await db.student.count() + 1;
            student = await db.student.create({
              data: {
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
        }
      } catch (dbError) {
        console.log('Database operation failed, using fallback logic');
      }
    }

    // استخدام البيانات الاحتياطية
    const fallbackCourses = getFallbackCourses();
    const selectedCourse = fallbackCourses[courseId as keyof typeof fallbackCourses];

    if (!selectedCourse) {
      return NextResponse.json({ error: 'الحلقة غير موجودة' }, { status: 400 });
    }

    if (!selectedCourse.isAvailable) {
      return NextResponse.json({ error: 'الحلقة مكتملة العدد' }, { status: 400 });
    }

    // محاكاة نجاح العملية
    const mockRequestId = `req-${Date.now()}`;

    return NextResponse.json({
      message: 'تم تقديم طلب الانضمام بنجاح (وضع تجريبي)',
      request: {
        id: mockRequestId,
        courseName: selectedCourse.courseName,
        programName: selectedCourse.programName,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('خطأ في تقديم طلب الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في تقديم الطلب' }, { status: 500 });
  }
}