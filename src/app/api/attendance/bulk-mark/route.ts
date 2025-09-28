import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER', 'TEACHER'].includes(session.user.userRole)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { attendanceRecords } = await request.json();

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return NextResponse.json({ error: 'لا توجد سجلات حضور للحفظ' }, { status: 400 });
    }

    // التحقق من صحة البيانات
    for (const record of attendanceRecords) {
      if (!record.studentId || !record.courseId || !record.status || !record.date) {
        return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
      }
    }

    // استخدام transaction لضمان تنفيذ جميع العمليات أو عدم تنفيذ أي منها
    const result = await db.$transaction(async (prisma) => {
      const results = [];

      for (const record of attendanceRecords) {
        const { studentId, courseId, status, notes, date } = record;

        // التحقق من صلاحية المعلمة للحلقة (إذا كانت معلمة)
        if (session.user.userRole === 'TEACHER') {
          const course = await prisma.course.findFirst({
            where: {
              id: courseId,
              teacher: {
                userEmail: session.user.email || '',
              }
            }
          });

          if (!course) {
            throw new Error(`غير مصرح لك بتسجيل الحضور لهذه الحلقة: ${courseId}`);
          }
        }

        // البحث عن سجل حضور موجود
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            studentId,
            courseId,
            date: new Date(date),
          },
        });

        let attendanceRecord;

        if (existingAttendance) {
          // تحديث السجل الموجود
          attendanceRecord = await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              status,
              notes: notes || '',
              updatedAt: new Date(),
            },
          });
        } else {
          // إنشاء سجل جديد
          attendanceRecord = await prisma.attendance.create({
            data: {
              studentId,
              courseId,
              status,
              notes: notes || '',
              date: new Date(date),
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