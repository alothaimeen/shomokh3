import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!studentId) {
      return NextResponse.json(
        { error: 'معرف الطالبة مطلوب' },
        { status: 400 }
      );
    }

    // للطالبة: يمكنها رؤية سجلها فقط
    if (session.user.userRole === 'STUDENT') {
      // للطالبة يجب أن تطلب سجلها الشخصي فقط
      // نحتاج للتحقق من أن هذه الطالبة هي نفسها المستخدمة
      // هذا يتطلب ربط جدول Student بـ User، لكن حالياً سنمنع الوصول
      return NextResponse.json(
        { error: 'لا يمكن الوصول لهذه البيانات حالياً' },
        { status: 403 }
      );
    }

    // للمعلمة: يمكنها رؤية سجل طالباتها فقط
    if (session.user.userRole === 'TEACHER' && courseId) {
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

    // بناء شروط البحث
    const whereConditions: any = {
      studentId,
    };

    if (courseId) {
      whereConditions.courseId = courseId;
    }

    if (startDate && endDate) {
      whereConditions.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // للمعلمة: إضافة شرط الحلقات التي تدرسها
    if (session.user.userRole === 'TEACHER') {
      whereConditions.course = {
        teacherId: session.user.id,
      };
    }

    // الحصول على سجلات الحضور
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereConditions,
      include: {
        course: {
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
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // الحصول على معلومات الطالبة
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        studentName: true,
        studentNumber: true,
        studentPhone: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'الطالبة غير موجودة' },
        { status: 404 }
      );
    }

    // حساب الإحصائيات
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'ABSENT').length;
    const lateDays = attendanceRecords.filter(r => r.status === 'LATE').length;
    const excusedDays = attendanceRecords.filter(r => r.status === 'EXCUSED').length;
    const leftEarlyDays = attendanceRecords.filter(r => r.status === 'LEFT_EARLY').length;

    const attendancePercentage = totalDays > 0 ?
      Math.round((presentDays / totalDays) * 100) : 0;

    return NextResponse.json({
      student,
      attendanceRecords,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        leftEarlyDays,
        attendancePercentage,
      },
    });

  } catch (error) {
    console.error('خطأ في الحصول على سجل الطالبة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الحصول على سجل الطالبة' },
      { status: 500 }
    );
  }
}