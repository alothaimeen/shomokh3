import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER', 'TEACHER'].includes(session.user.userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const dateParam = searchParams.get('date');

    if (!courseId) {
      return NextResponse.json(
        { error: 'معرف الحلقة مطلوب' },
        { status: 400 }
      );
    }

    // تحديد التاريخ (اليوم الحالي إذا لم يتم تحديده)
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // إرجاع بيانات اختبار للحضور
    const sampleCourse = {
      id: courseId,
      courseName: courseId === 'course-1' ? 'حلقة الفجر' :
                  courseId === 'course-2' ? 'حلقة المغرب' : 'حلقة العشاء',
      level: courseId === 'course-1' ? 1 : courseId === 'course-2' ? 2 : 1,
      program: {
        id: 'prog-1',
        programName: courseId === 'course-2' ? 'برنامج التجويد المتقدم' : 'برنامج الحفظ المكثف',
      },
      teacher: {
        id: 'teacher-1',
        userName: courseId === 'course-1' ? 'المعلمة سارة' :
                  courseId === 'course-2' ? 'المعلمة نورا' : 'المعلمة ريم',
      },
    };

    const sampleAttendanceData = [
      {
        student: {
          id: 'student-1',
          studentName: 'الطالبة فاطمة أحمد',
          studentNumber: 1001,
          studentPhone: '0501234567',
        },
        attendance: {
          id: 'att-1',
          status: 'PRESENT',
          notes: null,
        },
        status: 'PRESENT',
        notes: null,
      },
      {
        student: {
          id: 'student-2',
          studentName: 'الطالبة عائشة محمد',
          studentNumber: 1002,
          studentPhone: '0507654321',
        },
        attendance: {
          id: 'att-2',
          status: 'LATE',
          notes: 'تأخرت 10 دقائق',
        },
        status: 'LATE',
        notes: 'تأخرت 10 دقائق',
      },
      {
        student: {
          id: 'student-3',
          studentName: 'الطالبة خديجة علي',
          studentNumber: 1003,
          studentPhone: '0555555555',
        },
        attendance: null,
        status: null,
        notes: null,
      },
      {
        student: {
          id: 'student-4',
          studentName: 'الطالبة زينب حسن',
          studentNumber: 1004,
          studentPhone: '0509876543',
        },
        attendance: {
          id: 'att-4',
          status: 'EXCUSED',
          notes: 'إذن طبي',
        },
        status: 'EXCUSED',
        notes: 'إذن طبي',
      },
      {
        student: {
          id: 'student-5',
          studentName: 'الطالبة مريم علي',
          studentNumber: 1005,
          studentPhone: '0505551234',
        },
        attendance: {
          id: 'att-5',
          status: 'ABSENT',
          notes: null,
        },
        status: 'ABSENT',
        notes: null,
      }
    ];

    const summary = {
      totalStudents: 5,
      presentCount: 1,
      absentCount: 1,
      lateCount: 1,
      excusedCount: 1,
      leftEarlyCount: 0,
      notMarkedCount: 1,
    };

    return NextResponse.json({
      course: sampleCourse,
      date: targetDate,
      attendanceData: sampleAttendanceData,
      summary,
    });

  } catch (error) {
    console.error('خطأ في الحصول على الحضور:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الحصول على الحضور' },
      { status: 500 }
    );
  }
}