import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkCourseOwnership } from '@/lib/course-ownership';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.userRole)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { attendanceRecords } = await request.json();
    console.log('Received attendance records for bulk save:', attendanceRecords);

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return NextResponse.json({ error: 'لا توجد سجلات حضور للحفظ' }, { status: 400 });
    }

    // التحقق من صحة البيانات
    for (const record of attendanceRecords) {
      if (!record.studentId || !record.courseId || !record.status || !record.date) {
        return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
      }
    }

    // ✅ فحص ملكية الحلقات قبل بدء المعاملة
    const uniqueCourseIds = [...new Set(attendanceRecords.map((r: any) => r.courseId))];
    for (const courseId of uniqueCourseIds) {
      const hasAccess = await checkCourseOwnership(
        session.user.id,
        courseId,
        session.user.userRole
      );

      if (!hasAccess) {
        return NextResponse.json(
          { error: `غير مصرح بالوصول لحلقة: ${courseId}` },
          { status: 403 }
        );
      }
    }

    // استخدام transaction لضمان تنفيذ جميع العمليات أو عدم تنفيذ أي منها
    const result = await db.$transaction(async (prisma) => {
      const results = [];

      for (const record of attendanceRecords) {
        const { studentId, courseId, status, notes, date } = record;

        // البحث عن سجل حضور موجود
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0); // ضبط التاريخ بدون وقت
        console.log(`Searching for attendance on date: ${searchDate.toISOString()}`);

        const existingAttendance = await db.attendance.findFirst({
          where: {
            studentId,
            courseId,
            date: searchDate,
          },
        });

        console.log(`Found existing attendance: ${existingAttendance ? 'yes' : 'no'}`);
        if (existingAttendance) {
          console.log(`Existing attendance date: ${existingAttendance.date.toISOString()}`);
        }

        let attendanceRecord;

        if (existingAttendance) {
          // تحديث السجل الموجود
          attendanceRecord = await db.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              status,
              notes: notes || '',
              updatedAt: new Date(),
            },
          });
        } else {
          // إنشاء سجل جديد
          const attendanceDate = new Date(date);
          attendanceDate.setHours(0, 0, 0, 0); // ضبط التاريخ بدون وقت

          attendanceRecord = await db.attendance.create({
            data: {
              studentId,
              courseId,
              status,
              notes: notes || '',
              date: attendanceDate,
            },
          });
        }

        results.push(attendanceRecord);
      }

      return results;
    });

    return NextResponse.json({
      message: `تم حفظ ${result.length} سجل حضور بنجاح`,
      records: result.length
    });

  } catch (error) {
    console.error('خطأ في الحفظ المجمع للحضور:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'حدث خطأ في حفظ الحضور' },
      { status: 500 }
    );
  }
}
