import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - جلب جميع الطالبات
export async function GET(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const userRole = session.user.userRole;
    if (!['ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'لا تملك صلاحية عرض بيانات الطالبات' }, { status: 403 });
    }

    // جلب معاملات البحث والفلترة
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search') || '';
    const paymentFilter = searchParams.get('payment') || 'ALL';

    // بناء شروط البحث
    let whereConditions: any = {};

    if (searchTerm) {
      whereConditions.OR = [
        { studentName: { contains: searchTerm, mode: 'insensitive' } },
        { studentPhone: { contains: searchTerm } },
        { studentNumber: parseInt(searchTerm) || undefined }
      ].filter(condition => condition.studentNumber !== undefined || Object.keys(condition).length > 0);
    }

    if (paymentFilter !== 'ALL') {
      whereConditions.paymentStatus = paymentFilter;
    }

    // جلب الطالبات من قاعدة البيانات
    const students = await prisma.student.findMany({
      where: whereConditions,
      orderBy: { studentNumber: 'asc' }
    });

    return NextResponse.json(students);

  } catch (error) {
    console.error('خطأ في جلب الطالبات:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST - إضافة طالبة جديدة
export async function POST(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const userRole = session.user.userRole;
    if (!['ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'لا تملك صلاحية إضافة الطالبات' }, { status: 403 });
    }

    const body = await request.json();
    const {
      studentName,
      qualification,
      nationality,
      studentPhone,
      memorizedAmount,
      paymentStatus,
      memorizationPlan,
      notes
    } = body;

    if (!studentName?.trim()) {
      return NextResponse.json({ error: 'اسم الطالبة مطلوب' }, { status: 400 });
    }

    // الحصول على أعلى رقم تسلسلي
    const lastStudent = await prisma.student.findFirst({
      orderBy: { studentNumber: 'desc' }
    });

    const nextStudentNumber = (lastStudent?.studentNumber || 0) + 1;

    // إنشاء الطالبة الجديدة
    const newStudent = await prisma.student.create({
      data: {
        studentNumber: nextStudentNumber,
        studentName: studentName.trim(),
        qualification: qualification?.trim() || '',
        nationality: nationality?.trim() || '',
        studentPhone: studentPhone?.trim() || '',
        memorizedAmount: memorizedAmount?.trim() || '',
        paymentStatus: paymentStatus || 'UNPAID',
        memorizationPlan: memorizationPlan?.trim() || null,
        notes: notes?.trim() || null,
        isActive: true
      }
    });

    return NextResponse.json(newStudent);

  } catch (error) {
    console.error('خطأ في إضافة الطالبة:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// PUT - تحديث بيانات الطالبة
export async function PUT(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const userRole = session.user.userRole;
    if (!['ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'لا تملك صلاحية تعديل الطالبات' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, updateData } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'معرف الطالبة مطلوب' }, { status: 400 });
    }

    // تحديث بيانات الطالبة
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...updateData,
        studentName: updateData.studentName?.trim(),
        qualification: updateData.qualification?.trim(),
        nationality: updateData.nationality?.trim(),
        studentPhone: updateData.studentPhone?.trim(),
        memorizedAmount: updateData.memorizedAmount?.trim(),
        memorizationPlan: updateData.memorizationPlan?.trim() || null,
        notes: updateData.notes?.trim() || null
      }
    });

    return NextResponse.json(updatedStudent);

  } catch (error) {
    console.error('خطأ في تحديث الطالبة:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE - تغيير حالة الطالبة (تفعيل/إيقاف)
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من الصلاحيات
    const userRole = session.user.userRole;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'لا تملك صلاحية إيقاف الطالبات' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');
    const isActive = searchParams.get('isActive') === 'true';

    if (!studentId) {
      return NextResponse.json({ error: 'معرف الطالبة مطلوب' }, { status: 400 });
    }

    // تحديث حالة الطالبة
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { isActive }
    });

    return NextResponse.json({
      id: updatedStudent.id,
      isActive: updatedStudent.isActive
    });

  } catch (error) {
    console.error('خطأ في تحديث حالة الطالبة:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}