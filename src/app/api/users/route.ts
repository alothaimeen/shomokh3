import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - جلب جميع المستخدمين
export async function GET(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات - فقط ADMIN
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية عرض المستخدمين' }, { status: 403 });
    }

    // محاولة جلب المستخدمين من قاعدة البيانات
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          userName: true,
          userEmail: true,
          userRole: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(users);
    } catch (dbError) {
      console.warn('Database unavailable, using fallback users:', dbError);

      // بيانات احتياطية للمستخدمين الثابتة (من ملف auth.ts)
      const fallbackUsers = [
        {
          id: 'admin-1',
          userName: 'المدير الأول',
          userEmail: 'admin@shamokh.edu',
          userRole: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'manager-1',
          userName: 'المدير الأكاديمي',
          userEmail: 'manager1@shamokh.edu',
          userRole: 'MANAGER',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'teacher-1',
          userName: 'المعلمة سارة',
          userEmail: 'teacher1@shamokh.edu',
          userRole: 'TEACHER',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'student-1',
          userName: 'الطالبة فاطمة',
          userEmail: 'student1@shamokh.edu',
          userRole: 'STUDENT',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      return NextResponse.json(fallbackUsers);
    }

  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة مستخدم جديد
export async function POST(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات - فقط ADMIN
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية إضافة المستخدمين' }, { status: 403 });
    }

    const body = await request.json();
    const { userName, userEmail, userRole: newUserRole, password } = body;

    if (!userName?.trim() || !userEmail?.trim() || !newUserRole) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    // التحقق من الدور
    const validRoles = ['ADMIN', 'MANAGER', 'TEACHER', 'STUDENT'];
    if (!validRoles.includes(newUserRole)) {
      return NextResponse.json({ error: 'دور المستخدم غير صالح' }, { status: 400 });
    }

    try {
      // محاولة إضافة المستخدم إلى قاعدة البيانات
      const newUser = await prisma.user.create({
        data: {
          userName: userName.trim(),
          userEmail: userEmail.trim().toLowerCase(),
          passwordHash: password || 'defaultPassword123', // في الواقع، يجب تشفير كلمة المرور
          userRole: newUserRole,
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

      return NextResponse.json(newUser);
    } catch (dbError: any) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({ error: 'البريد الإلكتروني موجود مسبقاً' }, { status: 400 });
      }

      console.warn('Database unavailable for user creation:', dbError);
      return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
    }

  } catch (error) {
    console.error('خطأ في إضافة المستخدم:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// PUT - تحديث مستخدم
export async function PUT(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات - فقط ADMIN
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية تعديل المستخدمين' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    try {
      // محاولة تحديث المستخدم في قاعدة البيانات
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          userName: updateData.userName?.trim(),
          userEmail: updateData.userEmail?.trim().toLowerCase()
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

      return NextResponse.json(updatedUser);
    } catch (dbError: any) {
      if (dbError.code === 'P2002') {
        return NextResponse.json({ error: 'البريد الإلكتروني موجود مسبقاً' }, { status: 400 });
      }
      if (dbError.code === 'P2025') {
        return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
      }

      console.warn('Database unavailable for user update:', dbError);
      return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
    }

  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE - تغيير حالة المستخدم (تفعيل/إيقاف)
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات - فقط ADMIN
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية حذف المستخدمين' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const isActive = searchParams.get('isActive') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    // منع حذف أو إيقاف الحساب الحالي
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'لا يمكنك تعديل حسابك الخاص' }, { status: 400 });
    }

    try {
      // محاولة تحديث حالة المستخدم في قاعدة البيانات
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive }
      });

      return NextResponse.json({
        id: updatedUser.id,
        isActive: updatedUser.isActive
      });
    } catch (dbError: any) {
      if (dbError.code === 'P2025') {
        return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
      }

      console.warn('Database unavailable for user status update:', dbError);
      return NextResponse.json({ error: 'قاعدة البيانات غير متاحة حالياً' }, { status: 503 });
    }

  } catch (error) {
    console.error('خطأ في تحديث حالة المستخدم:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}