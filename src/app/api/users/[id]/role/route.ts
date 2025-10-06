import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH - تغيير دور المستخدم
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات - فقط ADMIN
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية تغيير أدوار المستخدمين' }, { status: 403 });
    }

    const params = await context.params;
    const userId = params.id;
    const body = await request.json();
    const { newRole } = body;

    if (!newRole) {
      return NextResponse.json({ error: 'الدور الجديد مطلوب' }, { status: 400 });
    }

    // التحقق من صحة الدور
    const validRoles = ['ADMIN', 'TEACHER', 'STUDENT'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({ error: 'الدور غير صالح' }, { status: 400 });
    }

    // منع تغيير دور الحساب الحالي
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'لا يمكنك تغيير دورك الخاص' }, { status: 400 });
    }

    try {
      // تحديث دور المستخدم في قاعدة البيانات
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { userRole: newRole },
        select: {
          id: true,
          userName: true,
          userEmail: true,
          userRole: true,
          isActive: true,
          createdAt: true
        }
      });

      return NextResponse.json({
        success: true,
        user: updatedUser
      });
    } catch (dbError: any) {
      if (dbError.code === 'P2025') {
        return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
      }

      console.warn('Database unavailable for role update:', dbError);
      return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
    }

  } catch (error) {
    console.error('خطأ في تغيير دور المستخدم:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}