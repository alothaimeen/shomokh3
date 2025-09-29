import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - جلب جميع البرامج
export async function GET(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب البرامج من قاعدة البيانات
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    // تحويل البيانات للشكل المطلوب
    const formattedPrograms = programs.map(program => ({
      id: program.id,
      programName: program.programName,
      programDescription: program.programDescription || '',
      isActive: program.isActive,
      createdAt: program.createdAt.toISOString().split('T')[0],
      coursesCount: program._count.courses
    }));

    return NextResponse.json(formattedPrograms);

  } catch (error) {
    console.error('خطأ في جلب البرامج:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة برنامج جديد
export async function POST(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية إضافة البرامج' }, { status: 403 });
    }

    const body = await request.json();
    const { programName, programDescription } = body;

    if (!programName?.trim()) {
      return NextResponse.json({ error: 'اسم البرنامج مطلوب' }, { status: 400 });
    }

    // إنشاء البرنامج الجديد
    const newProgram = await prisma.program.create({
      data: {
        programName: programName.trim(),
        programDescription: programDescription?.trim() || '',
        isActive: true
      }
    });

    return NextResponse.json({
      id: newProgram.id,
      programName: newProgram.programName,
      programDescription: newProgram.programDescription,
      isActive: newProgram.isActive,
      createdAt: newProgram.createdAt.toISOString().split('T')[0],
      coursesCount: 0
    });

  } catch (error) {
    console.error('خطأ في إضافة البرنامج:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// PUT - تحديث حالة البرنامج (تفعيل/إيقاف)
export async function PUT(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية تعديل البرامج' }, { status: 403 });
    }

    const body = await request.json();
    const { programId, isActive } = body;

    if (!programId) {
      return NextResponse.json({ error: 'معرف البرنامج مطلوب' }, { status: 400 });
    }

    // تحديث حالة البرنامج
    const updatedProgram = await prisma.program.update({
      where: { id: programId },
      data: { isActive: Boolean(isActive) }
    });

    return NextResponse.json({
      id: updatedProgram.id,
      isActive: updatedProgram.isActive
    });

  } catch (error) {
    console.error('خطأ في تحديث البرنامج:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}