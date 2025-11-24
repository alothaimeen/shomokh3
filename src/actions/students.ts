'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function createStudent(formData: FormData) {
  const studentName = formData.get('studentName') as string;
  const qualification = formData.get('qualification') as string;
  const nationality = formData.get('nationality') as string;
  const studentPhone = formData.get('studentPhone') as string;
  const memorizedAmount = formData.get('memorizedAmount') as string;
  const paymentStatus = formData.get('paymentStatus') as string;
  const memorizationPlan = formData.get('memorizationPlan') as string;
  const notes = formData.get('notes') as string;

  if (!studentName || !qualification || !nationality || !studentPhone) {
    return { error: 'الحقول الأساسية مطلوبة' };
  }

  try {
    // الحصول على آخر رقم طالبة
    const lastStudent = await db.student.findFirst({
      orderBy: { studentNumber: 'desc' },
      select: { studentNumber: true }
    });

    const studentNumber = lastStudent ? lastStudent.studentNumber + 1 : 1;

    const newStudent = await db.student.create({
      data: {
        studentNumber,
        studentName,
        qualification,
        nationality,
        studentPhone,
        memorizedAmount: memorizedAmount || '',
        paymentStatus: paymentStatus as any,
        memorizationPlan: memorizationPlan || null,
        notes: notes || null,
        isActive: true
      },
      select: {
        id: true,
        studentNumber: true,
        studentName: true,
        qualification: true,
        nationality: true,
        studentPhone: true,
        memorizedAmount: true,
        paymentStatus: true,
        memorizationPlan: true,
        notes: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/students');
    return { success: true, student: newStudent };
  } catch (error) {
    console.error('خطأ في إنشاء الطالبة:', error);
    return { error: 'فشل في إنشاء الطالبة' };
  }
}

export async function updateStudent(formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const studentName = formData.get('studentName') as string;
  const qualification = formData.get('qualification') as string;
  const nationality = formData.get('nationality') as string;
  const studentPhone = formData.get('studentPhone') as string;
  const memorizedAmount = formData.get('memorizedAmount') as string;
  const paymentStatus = formData.get('paymentStatus') as string;
  const memorizationPlan = formData.get('memorizationPlan') as string;
  const notes = formData.get('notes') as string;

  if (!studentId || !studentName || !qualification || !nationality || !studentPhone) {
    return { error: 'الحقول الأساسية مطلوبة' };
  }

  try {
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: {
        studentName,
        qualification,
        nationality,
        studentPhone,
        memorizedAmount: memorizedAmount || '',
        paymentStatus: paymentStatus as any,
        memorizationPlan: memorizationPlan || null,
        notes: notes || null
      },
      select: {
        id: true,
        studentNumber: true,
        studentName: true,
        qualification: true,
        nationality: true,
        studentPhone: true,
        memorizedAmount: true,
        paymentStatus: true,
        memorizationPlan: true,
        notes: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/students');
    return { success: true, student: updatedStudent };
  } catch (error) {
    console.error('خطأ في تحديث الطالبة:', error);
    return { error: 'فشل في تحديث الطالبة' };
  }
}

export async function toggleStudentStatus(studentId: string) {
  if (!studentId) {
    return { error: 'معرف الطالبة مطلوب' };
  }

  try {
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { isActive: true }
    });

    if (!student) {
      return { error: 'الطالبة غير موجودة' };
    }

    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: { isActive: !student.isActive },
      select: {
        id: true,
        studentNumber: true,
        studentName: true,
        qualification: true,
        nationality: true,
        studentPhone: true,
        memorizedAmount: true,
        paymentStatus: true,
        memorizationPlan: true,
        notes: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/students');
    return { success: true, student: updatedStudent };
  } catch (error) {
    console.error('خطأ في تغيير حالة الطالبة:', error);
    return { error: 'فشل في تغيير حالة الطالبة' };
  }
}

export async function updatePaymentStatus(studentId: string, newStatus: string) {
  if (!studentId || !newStatus) {
    return { error: 'معرف الطالبة وحالة الدفع مطلوبان' };
  }

  if (!['PAID', 'UNPAID', 'PARTIAL'].includes(newStatus)) {
    return { error: 'حالة الدفع غير صالحة' };
  }

  try {
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: { paymentStatus: newStatus as any },
      select: {
        id: true,
        studentNumber: true,
        studentName: true,
        qualification: true,
        nationality: true,
        studentPhone: true,
        memorizedAmount: true,
        paymentStatus: true,
        memorizationPlan: true,
        notes: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/students');
    return { success: true, student: updatedStudent };
  } catch (error) {
    console.error('خطأ في تحديث حالة الدفع:', error);
    return { error: 'فشل في تحديث حالة الدفع' };
  }
}
