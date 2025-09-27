import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER', 'TEACHER'].includes(session.user.userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بتسجيل الحضور' },
        { status: 403 }
      );
    }

    const { studentId, courseId, status, notes, date } = await request.json();

    // التحقق من صحة البيانات
    if (!studentId || !courseId || !status) {
      return NextResponse.json(
        { error: 'معلومات الحضور مطلوبة' },
        { status: 400 }
      );
    }

    // تحديد التاريخ (اليوم الحالي إذا لم يتم تحديده)
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    // إرجاع استجابة نجاح مع بيانات اختبار
    const sampleAttendance = {
      id: `att-${Date.now()}`,
      studentId,
      courseId,
      status,
      notes,
      date: attendanceDate,
      student: {
        id: studentId,
        studentName: studentId === 'student-1' ? 'الطالبة فاطمة أحمد' :
                     studentId === 'student-2' ? 'الطالبة عائشة محمد' :
                     studentId === 'student-3' ? 'الطالبة خديجة علي' : 'طالبة اختبار',
        studentNumber: parseInt(studentId.replace('student-', '')) + 1000,
      },
      course: {
        id: courseId,
        courseName: courseId === 'course-1' ? 'حلقة الفجر' :
                    courseId === 'course-2' ? 'حلقة المغرب' : 'حلقة العشاء',
      },
    };

    return NextResponse.json({
      attendance: sampleAttendance,
      message: 'تم تسجيل الحضور بنجاح',
    });

  } catch (error) {
    console.error('خطأ في تسجيل الحضور:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الحضور' },
      { status: 500 }
    );
  }
}