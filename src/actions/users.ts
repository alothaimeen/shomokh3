'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function createUser(formData: FormData) {
  const userName = formData.get('userName') as string;
  const userEmail = formData.get('userEmail') as string;
  const userRole = formData.get('userRole') as string;
  const password = formData.get('password') as string;

  if (!userName || !userEmail || !userRole) {
    return { error: 'جميع الحقول مطلوبة' };
  }

  try {
    // التحقق من وجود البريد الإلكتروني
    const existingUser = await db.user.findUnique({
      where: { userEmail }
    });

    if (existingUser) {
      return { error: 'البريد الإلكتروني مستخدم بالفعل' };
    }

    // استخدام كلمة مرور افتراضية إذا لم يتم تقديمها
    const finalPassword = password || 'Shamokh@2025';
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    const newUser = await db.user.create({
      data: {
        userName,
        userEmail,
        userRole: userRole as any,
        passwordHash,
        isActive: true
      },
      select: {
        id: true,
        userName: true,
        userEmail: true,
        userRole: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/users');
    return { success: true, user: newUser };
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
    return { error: 'فشل في إنشاء المستخدم' };
  }
}

export async function updateUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  const userName = formData.get('userName') as string;
  const userEmail = formData.get('userEmail') as string;

  if (!userId || !userName || !userEmail) {
    return { error: 'جميع الحقول مطلوبة' };
  }

  try {
    // التحقق من عدم تكرار البريد الإلكتروني
    const existingUser = await db.user.findFirst({
      where: {
        userEmail,
        NOT: { id: userId }
      }
    });

    if (existingUser) {
      return { error: 'البريد الإلكتروني مستخدم بالفعل' };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { userName, userEmail },
      select: {
        id: true,
        userName: true,
        userEmail: true,
        userRole: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error);
    return { error: 'فشل في تحديث المستخدم' };
  }
}

export async function toggleUserStatus(userId: string) {
  if (!userId) {
    return { error: 'معرف المستخدم مطلوب' };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });

    if (!user) {
      return { error: 'المستخدم غير موجود' };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        userName: true,
        userEmail: true,
        userRole: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('خطأ في تغيير حالة المستخدم:', error);
    return { error: 'فشل في تغيير حالة المستخدم' };
  }
}

export async function changeUserRole(userId: string, newRole: string) {
  if (!userId || !newRole) {
    return { error: 'معرف المستخدم والدور الجديد مطلوبان' };
  }

  if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(newRole)) {
    return { error: 'الدور غير صالح' };
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { userRole: newRole as any },
      select: {
        id: true,
        userName: true,
        userEmail: true,
        userRole: true,
        isActive: true,
        createdAt: true
      }
    });

    revalidatePath('/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('خطأ في تغيير دور المستخدم:', error);
    return { error: 'فشل في تغيير دور المستخدم' };
  }
}
