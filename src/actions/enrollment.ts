'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types';

const enrollmentSchema = z.object({
  courseId: z.string().cuid(),
  message: z.string().max(500).optional(),
});

export async function enrollInCourse(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<{ enrollmentId: string }>> {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== 'STUDENT') {
      return { success: false, error: 'هذه الميزة للطالبات فقط' };
    }

    const parsed = enrollmentSchema.safeParse({
      courseId: formData.get('courseId'),
      message: formData.get('message'),
    });

    if (!parsed.success) {
      return { success: false, error: 'البيانات المدخلة غير صحيحة' };
    }

    const { courseId, message } = parsed.data;

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    });

    if (!course || !course.isActive) {
      return { success: false, error: 'الحلقة غير موجودة أو غير نشطة' };
    }

    if (course._count.enrollments >= course.maxStudents) {
      return { success: false, error: 'الحلقة ممتلئة' };
    }

    const existingRequest = await db.enrollmentRequest.findFirst({
      where: {
        studentId: session.user.id,
        courseId: courseId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return { success: false, error: 'لديك طلب انضمام معلق بالفعل' };
    }

    const request = await db.enrollmentRequest.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
        message: message || '',
        status: 'PENDING'
      }
    });

    revalidatePath('/enrollment');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { enrollmentId: request.id },
      message: 'تم إرسال طلب الانضمام بنجاح'
    };

  } catch (error) {
    console.error('Error in enrollInCourse:', error);
    return { success: false, error: 'حدث خطأ أثناء إرسال الطلب' };
  }
}
