'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateDailyTask(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: 'غير مصادق عليه' };
  }

  if (session.user.role !== 'STUDENT') {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const courseId = formData.get('courseId') as string;
    const date = formData.get('date') as string;
    const listening5Times = formData.get('listening5Times') === 'true';
    const repetition10Times = formData.get('repetition10Times') === 'true';
    const recitedToPeer = formData.get('recitedToPeer') === 'true';
    const notes = formData.get('notes') as string || null;

    if (!courseId || !date) {
      return { success: false, error: 'بيانات غير مكتملة' };
    }

    // Verify enrollment
    const enrollment = await db.enrollment.findFirst({
      where: {
        id: courseId,
        studentId: session.user.id
      }
    });

    if (!enrollment) {
      return { success: false, error: 'غير مسجل في هذه الحلقة' };
    }

    // Check if task exists
    const existingTask = await db.dailyTask.findFirst({
      where: {
        courseId,
        studentId: session.user.id,
        date: new Date(date)
      }
    });

    if (existingTask) {
      // Update existing task
      await db.dailyTask.update({
        where: { id: existingTask.id },
        data: {
          listening5Times,
          repetition10Times,
          recitedToPeer,
          notes
        }
      });
    } else {
      // Create new task
      await db.dailyTask.create({
        data: {
          courseId,
          studentId: session.user.id,
          date: new Date(date),
          listening5Times,
          repetition10Times,
          recitedToPeer,
          notes
        }
      });
    }

    revalidatePath('/daily-tasks');
    return { success: true };
  } catch (error) {
    console.error('Error updating daily task:', error);
    return { success: false, error: 'حدث خطأ أثناء الحفظ' };
  }
}
