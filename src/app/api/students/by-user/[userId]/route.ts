import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // التحقق من أن المستخدم يطلب معلوماته الشخصية فقط (أو أنه ADMIN)
    if (session.user.userRole !== 'ADMIN' && session.user.id !== userId) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { userId },
      select: {
        id: true,
        studentName: true,
        studentNumber: true,
        studentPhone: true,
        memorizedAmount: true,
        qualification: true,
        nationality: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'الطالبة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);

  } catch (error) {
    console.error('خطأ في جلب بيانات الطالبة:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب بيانات الطالبة' },
      { status: 500 }
    );
  }
}
