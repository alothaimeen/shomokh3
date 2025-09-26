import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AttendanceStatus } from '@prisma/client';

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

    // إذا كان المستخدم معلم، التأكد أنه يسجل الحضور لحلقته فقط
    if (session.user.userRole === 'TEACHER') {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          teacherId: session.user.id,
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: 'لا يمكنك تسجيل الحضور لهذه الحلقة' },
          { status: 403 }
        );
      }
    }

    // تحديد التاريخ (اليوم الحالي إذا لم يتم تحديده)
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // جعل الوقت منتصف الليل

    // البحث عن سجل حضور موجود لنفس الطالبة والحلقة والتاريخ
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        courseId,
        date: attendanceDate,
      },
    });

    let attendance;

    if (existingAttendance) {
      // تحديث السجل الموجود
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: status as AttendanceStatus,
          notes,
        },
        include: {
          student: {
            select: {
              id: true,
              studentName: true,
              studentNumber: true,
            },
          },
          course: {
            select: {
              id: true,
              courseName: true,
            },
          },
        },
      });
    } else {
      // إنشاء سجل جديد
      attendance = await prisma.attendance.create({
        data: {
          studentId,
          courseId,
          status: status as AttendanceStatus,
          notes,
          date: attendanceDate,
        },
        include: {
          student: {
            select: {
              id: true,
              studentName: true,
              studentNumber: true,
            },
          },
          course: {
            select: {
              id: true,
              courseName: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      attendance,
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