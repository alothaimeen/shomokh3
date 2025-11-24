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

export async function acceptRequest(requestId: string): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== 'TEACHER') {
      return { success: false, error: 'غير مصرح' };
    }

    const request = await db.enrollmentRequest.findUnique({
      where: { id: requestId },
      include: { 
        course: { select: { teacherId: true, maxStudents: true, _count: { select: { enrollments: true } } } },
        student: true
      }
    });

    if (!request) {
      return { success: false, error: 'الطلب غير موجود' };
    }

    if (request.course.teacherId !== session.user.id) {
      return { success: false, error: 'غير مصرح - ليس من حلقاتك' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: 'الطلب تمت معالجته مسبقاً' };
    }

    if (request.course._count.enrollments >= request.course.maxStudents) {
      return { success: false, error: 'الحلقة ممتلئة' };
    }

    await db.$transaction([
      db.enrollmentRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' }
      }),
      db.enrollment.create({
        data: {
          studentId: request.studentId,
          courseId: request.courseId
        }
      })
    ]);

    revalidatePath('/teacher-requests');
    revalidatePath('/enrolled-students');

    return { success: true, data: undefined, message: 'تم قبول الطلب بنجاح' };

  } catch (error) {
    console.error('Error in acceptRequest:', error);
    return { success: false, error: 'حدث خطأ أثناء معالجة الطلب' };
  }
}

export async function rejectRequest(requestId: string): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== 'TEACHER') {
      return { success: false, error: 'غير مصرح' };
    }

    const request = await db.enrollmentRequest.findUnique({
      where: { id: requestId },
      include: { course: { select: { teacherId: true } } }
    });

    if (!request) {
      return { success: false, error: 'الطلب غير موجود' };
    }

    if (request.course.teacherId !== session.user.id) {
      return { success: false, error: 'غير مصرح - ليس من حلقاتك' };
    }

    if (request.status !== 'PENDING') {
      return { success: false, error: 'الطلب تمت معالجته مسبقاً' };
    }

    await db.enrollmentRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    revalidatePath('/teacher-requests');

    return { success: true, data: undefined, message: 'تم رفض الطلب' };

  } catch (error) {
    console.error('Error in rejectRequest:', error);
    return { success: false, error: 'حدث خطأ أثناء معالجة الطلب' };
  }
}

export async function acceptMultipleRequests(requestIds: string[]): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== 'TEACHER') {
      return { success: false, error: 'غير مصرح' };
    }

    const requests = await db.enrollmentRequest.findMany({
      where: { 
        id: { in: requestIds },
        status: 'PENDING',
        course: { teacherId: session.user.id }
      },
      include: { 
        course: { select: { maxStudents: true, _count: { select: { enrollments: true } } } }
      }
    });

    const validRequests = requests.filter(
      r => r.course._count.enrollments < r.course.maxStudents
    );

    if (validRequests.length === 0) {
      return { success: false, error: 'لا توجد طلبات صالحة للقبول' };
    }

    await db.$transaction([
      ...validRequests.map(r => 
        db.enrollmentRequest.update({
          where: { id: r.id },
          data: { status: 'ACCEPTED' }
        })
      ),
      ...validRequests.map(r =>
        db.enrollment.create({
          data: {
            studentId: r.studentId,
            courseId: r.courseId
          }
        })
      )
    ]);

    revalidatePath('/teacher-requests');
    revalidatePath('/enrolled-students');

    return { success: true, data: undefined, message: `تم قبول ${validRequests.length} طلب` };

  } catch (error) {
    console.error('Error in acceptMultipleRequests:', error);
    return { success: false, error: 'حدث خطأ أثناء معالجة الطلبات' };
  }
}

export async function rejectMultipleRequests(requestIds: string[]): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== 'TEACHER') {
      return { success: false, error: 'غير مصرح' };
    }

    const result = await db.enrollmentRequest.updateMany({
      where: { 
        id: { in: requestIds },
        status: 'PENDING',
        course: { teacherId: session.user.id }
      },
      data: { status: 'REJECTED' }
    });

    revalidatePath('/teacher-requests');

    return { success: true, data: undefined, message: `تم رفض ${result.count} طلب` };

  } catch (error) {
    console.error('Error in rejectMultipleRequests:', error);
    return { success: false, error: 'حدث خطأ أثناء معالجة الطلبات' };
  }
}
