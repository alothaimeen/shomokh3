import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('بدء استدعاء API للطالبات المسجلات');
    const session = await getServerSession(authOptions);
    console.log('الجلسة:', session ? 'موجودة' : 'غير موجودة');

    if (!session || !['TEACHER', 'ADMIN', 'MANAGER'].includes(session.user.userRole)) {
      console.log('خطأ في الصلاحية - الدور:', session?.user?.userRole);
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    console.log('الصلاحية صحيحة - الدور:', session.user.userRole);

    // إرجاع بيانات اختبار مباشرة
    console.log('عرض بيانات اختبار للطالبات المسجلات');

    const sampleData = {
      enrollments: [
        {
          id: 'sample-1',
          enrolledAt: new Date().toISOString(),
          student: {
            id: 'student-1',
            studentNumber: 1001,
            studentName: 'الطالبة فاطمة أحمد',
            studentPhone: '0501234567',
            qualification: 'ثانوية عامة',
            nationality: 'سعودية',
            memorizedAmount: '5 أجزاء',
            paymentStatus: 'PAID',
            memorizationPlan: 'خطة المراجعة السريعة',
          },
          course: {
            id: 'course-1',
            courseName: 'حلقة الفجر',
            level: 1,
            maxStudents: 15,
            programName: 'برنامج الحفظ المكثف',
            teacherName: 'المعلمة سارة',
          }
        },
        {
          id: 'sample-2',
          enrolledAt: new Date().toISOString(),
          student: {
            id: 'student-2',
            studentNumber: 1002,
            studentName: 'الطالبة عائشة محمد',
            studentPhone: '0507654321',
            qualification: 'بكالوريوس',
            nationality: 'مصرية',
            memorizedAmount: '10 أجزاء',
            paymentStatus: 'PARTIAL',
            memorizationPlan: 'خطة التحفيظ المتدرج',
          },
          course: {
            id: 'course-1',
            courseName: 'حلقة الفجر',
            level: 1,
            maxStudents: 15,
            programName: 'برنامج الحفظ المكثف',
            teacherName: 'المعلمة سارة',
          }
        },
        {
          id: 'sample-3',
          enrolledAt: new Date().toISOString(),
          student: {
            id: 'student-3',
            studentNumber: 1003,
            studentName: 'الطالبة خديجة علي',
            studentPhone: '0555555555',
            qualification: 'ماجستير',
            nationality: 'سعودية',
            memorizedAmount: '30 جزء',
            paymentStatus: 'UNPAID',
            memorizationPlan: 'خطة المراجعة المكثفة',
          },
          course: {
            id: 'course-2',
            courseName: 'حلقة المغرب',
            level: 2,
            maxStudents: 20,
            programName: 'برنامج التجويد المتقدم',
            teacherName: 'المعلمة نورا',
          }
        }
      ],
      enrollmentsByCourse: [
        {
          course: {
            id: 'course-1',
            courseName: 'حلقة الفجر',
            level: 1,
            maxStudents: 15,
            programName: 'برنامج الحفظ المكثف',
            teacherName: 'المعلمة سارة',
          },
          students: [
            {
              id: 'sample-1',
              enrolledAt: new Date().toISOString(),
              student: {
                id: 'student-1',
                studentNumber: 1001,
                studentName: 'الطالبة فاطمة أحمد',
                studentPhone: '0501234567',
                qualification: 'ثانوية عامة',
                nationality: 'سعودية',
                memorizedAmount: '5 أجزاء',
                paymentStatus: 'PAID',
                memorizationPlan: 'خطة المراجعة السريعة',
              },
              course: {
                id: 'course-1',
                courseName: 'حلقة الفجر',
                level: 1,
                maxStudents: 15,
                programName: 'برنامج الحفظ المكثف',
                teacherName: 'المعلمة سارة',
              }
            },
            {
              id: 'sample-2',
              enrolledAt: new Date().toISOString(),
              student: {
                id: 'student-2',
                studentNumber: 1002,
                studentName: 'الطالبة عائشة محمد',
                studentPhone: '0507654321',
                qualification: 'بكالوريوس',
                nationality: 'مصرية',
                memorizedAmount: '10 أجزاء',
                paymentStatus: 'PARTIAL',
                memorizationPlan: 'خطة التحفيظ المتدرج',
              },
              course: {
                id: 'course-1',
                courseName: 'حلقة الفجر',
                level: 1,
                maxStudents: 15,
                programName: 'برنامج الحفظ المكثف',
                teacherName: 'المعلمة سارة',
              }
            }
          ],
          studentsCount: 2
        },
        {
          course: {
            id: 'course-2',
            courseName: 'حلقة المغرب',
            level: 2,
            maxStudents: 20,
            programName: 'برنامج التجويد المتقدم',
            teacherName: 'المعلمة نورا',
          },
          students: [
            {
              id: 'sample-3',
              enrolledAt: new Date().toISOString(),
              student: {
                id: 'student-3',
                studentNumber: 1003,
                studentName: 'الطالبة خديجة علي',
                studentPhone: '0555555555',
                qualification: 'ماجستير',
                nationality: 'سعودية',
                memorizedAmount: '30 جزء',
                paymentStatus: 'UNPAID',
                memorizationPlan: 'خطة المراجعة المكثفة',
              },
              course: {
                id: 'course-2',
                courseName: 'حلقة المغرب',
                level: 2,
                maxStudents: 20,
                programName: 'برنامج التجويد المتقدم',
                teacherName: 'المعلمة نورا',
              }
            }
          ],
          studentsCount: 1
        }
      ],
      summary: {
        totalEnrollments: 3,
        totalCourses: 2,
        averageStudentsPerCourse: 2,
      }
    };

    return NextResponse.json(sampleData);

  } catch (error) {
    console.error('خطأ في جلب الطالبات المسجلات:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}