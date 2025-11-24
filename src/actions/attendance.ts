'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { AttendanceStatus } from '@prisma/client';

interface AttendanceRecord {
  studentId: string;
  courseId: string;
  status: AttendanceStatus;
  notes: string;
  date: string;
}

export async function saveAttendanceBulk(attendanceRecords: AttendanceRecord[]) {
  try {
    // استخدام upsert لكل سجل لتحديث أو إنشاء
    await Promise.all(
      attendanceRecords.map((record) =>
        db.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: record.studentId,
              courseId: record.courseId,
              date: new Date(record.date),
            },
          },
          update: {
            status: record.status,
            notes: record.notes || null,
          },
          create: {
            studentId: record.studentId,
            courseId: record.courseId,
            date: new Date(record.date),
            status: record.status,
            notes: record.notes || null,
          },
        })
      )
    );

    revalidatePath('/attendance');
    return { success: true, message: 'تم حفظ الحضور بنجاح' };
  } catch (error) {
    console.error('Error saving attendance:', error);
    return { success: false, error: 'حدث خطأ في حفظ الحضور' };
  }
}
