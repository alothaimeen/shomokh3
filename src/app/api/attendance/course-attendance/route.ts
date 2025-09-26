import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    // إذا كان المستخدم معلم، التأكد أنه يطلب حضور حلقته فقط
    if (session.user.userRole === 'TEACHER') {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          teacherId: session.user.id,
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: 'لا يمكنك الوصول لحضور هذه الحلقة' },
          { status: 403 }
        );
      }
    }

    // تحديد التاريخ (اليوم الحالي إذا لم يتم تحديده)
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // الحصول على جميع الطالبات المسجلات في الحلقة
    const enrolledStudents = await prisma.enrollment.findMany({
      where: {
        courseId,
        isActive: true,
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
            studentPhone: true,
          },
        },
      },
    });

    // الحصول على سجلات الحضور لهذا التاريخ
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        courseId,
        date: targetDate,
      },
    });

    // دمج البيانات لإنشاء قائمة شاملة
    const attendanceData = enrolledStudents.map((enrollment) => {
      const attendanceRecord = attendanceRecords.find(
        (record) => record.studentId === enrollment.student.id
      );

      return {
        student: enrollment.student,
        attendance: attendanceRecord || null,
        status: attendanceRecord?.status || null,
        notes: attendanceRecord?.notes || null,
      };
    });

    // الحصول على معلومات الحلقة
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        courseName: true,
        level: true,
        program: {
          select: {
            id: true,
            programName: true,
          },
        },
        teacher: {
          select: {
            id: true,
            userName: true,
          },
        },
      },
    });

    return NextResponse.json({
      course,
      date: targetDate,
      attendanceData,
      summary: {
        totalStudents: enrolledStudents.length,
        presentCount: attendanceRecords.filter(r => r.status === 'PRESENT').length,
        absentCount: attendanceRecords.filter(r => r.status === 'ABSENT').length,
        lateCount: attendanceRecords.filter(r => r.status === 'LATE').length,
        excusedCount: attendanceRecords.filter(r => r.status === 'EXCUSED').length,
        leftEarlyCount: attendanceRecords.filter(r => r.status === 'LEFT_EARLY').length,
        notMarkedCount: enrolledStudents.length - attendanceRecords.length,
      },
    });

  } catch (error) {
    console.error('خطأ في الحصول على الحضور:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الحصول على الحضور' },
      { status: 500 }
    );
  }
}