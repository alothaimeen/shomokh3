import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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
    console.log(`Fetching attendance for date: ${targetDate.toISOString()}`);

    // جلب معلومات الحلقة
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
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
    });

    if (!course) {
      return NextResponse.json(
        { error: 'الحلقة غير موجودة' },
        { status: 404 }
      );
    }

    // جلب جميع الطالبات المسجلات في الحلقة
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId: courseId,
        isActive: true
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
            studentPhone: true,
          }
        }
      }
    });

    // جلب سجلات الحضور لليوم المحدد
    const attendanceRecords = await db.attendance.findMany({
      where: {
        courseId: courseId,
        date: targetDate
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
            studentPhone: true,
          }
        }
      }
    });

    console.log(`Found ${attendanceRecords.length} attendance records`);
    attendanceRecords.forEach(record => {
      console.log(`Student ${record.student.studentName}: ${record.status} on ${record.date.toISOString()}`);
    });

    // ربط البيانات: كل طالبة مع سجل حضورها (إن وُجد)
    const attendanceData = enrollments.map(enrollment => {
      const attendanceRecord = attendanceRecords.find(
        record => record.studentId === enrollment.student.id
      );

      return {
        student: {
          id: enrollment.student.id,
          studentName: enrollment.student.studentName,
          studentNumber: enrollment.student.studentNumber,
          studentPhone: enrollment.student.studentPhone,
        },
        attendance: attendanceRecord ? {
          id: attendanceRecord.id,
          status: attendanceRecord.status,
          notes: attendanceRecord.notes,
        } : null,
        status: attendanceRecord?.status || null,
        notes: attendanceRecord?.notes || null,
      };
    });

    // حساب الملخص
    const summary = {
      totalStudents: attendanceData.length,
      presentCount: attendanceData.filter(item => item.status === 'PRESENT').length,
      absentCount: attendanceData.filter(item => item.status === 'ABSENT').length,
      lateCount: attendanceData.filter(item => item.status === 'LATE').length,
      excusedCount: attendanceData.filter(item => item.status === 'EXCUSED').length,
      leftEarlyCount: attendanceData.filter(item => item.status === 'LEFT_EARLY').length,
      notMarkedCount: attendanceData.filter(item => item.status === null).length,
    };

    return NextResponse.json({
      course: {
        id: course.id,
        courseName: course.courseName,
        level: course.level,
        program: course.program,
        teacher: course.teacher,
      },
      date: targetDate,
      attendanceData,
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