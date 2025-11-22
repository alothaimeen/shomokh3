import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.userRole)) {
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

    // التحقق من وجود الطالبة والحلقة
    const enrollment = await db.enrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId,
        isActive: true
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
          }
        },
        course: {
          select: {
            id: true,
            courseName: true,
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'الطالبة غير مسجلة في هذه الحلقة' },
        { status: 400 }
      );
    }

    // إنشاء أو تحديث سجل الحضور
    const attendance = await db.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId: studentId,
          courseId: courseId,
          date: attendanceDate
        }
      },
      update: {
        status: status,
        notes: notes || null,
      },
      create: {
        studentId: studentId,
        courseId: courseId,
        status: status,
        notes: notes || null,
        date: attendanceDate,
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
          }
        },
        course: {
          select: {
            id: true,
            courseName: true,
          }
        }
      }
    });

    return NextResponse.json({
      attendance: attendance,
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
