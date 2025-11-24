'use server';

import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types';

export async function cancelEnrollment(enrollmentId: string): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    
    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return { success: false, error: 'غير مصرح' };
    }

    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { select: { teacherId: true } } }
    });

    if (!enrollment) {
      return { success: false, error: 'التسجيل غير موجود' };
    }

    if (session.user.role === 'TEACHER' && enrollment.course.teacherId !== session.user.id) {
      return { success: false, error: 'غير مصرح - ليس من حلقاتك' };
    }

    await db.enrollment.delete({
      where: { id: enrollmentId }
    });

    revalidatePath('/enrolled-students');
    revalidatePath('/dashboard');

    return { success: true, data: undefined, message: 'تم إلغاء التسجيل بنجاح' };

  } catch (error) {
    console.error('Error in cancelEnrollment:', error);
    return { success: false, error: 'حدث خطأ أثناء إلغاء التسجيل' };
  }
}

export async function cancelMultipleEnrollments(enrollmentIds: string[]): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    
    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return { success: false, error: 'غير مصرح' };
    }

    const whereClause: any = { id: { in: enrollmentIds } };
    
    if (session.user.role === 'TEACHER') {
      whereClause.course = { teacherId: session.user.id };
    }

    const result = await db.enrollment.deleteMany({
      where: whereClause
    });

    revalidatePath('/enrolled-students');
    revalidatePath('/dashboard');

    return { success: true, data: undefined, message: `تم إلغاء ${result.count} تسجيل` };

  } catch (error) {
    console.error('Error in cancelMultipleEnrollments:', error);
    return { success: false, error: 'حدث خطأ أثناء إلغاء التسجيلات' };
  }
}

export async function updateStudentName(studentId: string, newName: string): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    
    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return { success: false, error: 'غير مصرح' };
    }

    if (!newName || newName.trim().length < 3) {
      return { success: false, error: 'الاسم يجب أن يكون 3 أحرف على الأقل' };
    }

    await db.student.update({
      where: { id: studentId },
      data: { studentName: newName.trim() }
    });

    revalidatePath('/enrolled-students');
    revalidatePath('/students');

    return { success: true, data: undefined, message: 'تم تحديث اسم الطالبة بنجاح' };

  } catch (error) {
    console.error('Error in updateStudentName:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث الاسم' };
  }
}
