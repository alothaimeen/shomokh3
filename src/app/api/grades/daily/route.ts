import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkCourseOwnership } from '@/lib/course-ownership';

export async function GET(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من صلاحية الوصول للحلقة
    const hasAccess = await checkCourseOwnership(userId, courseId, role);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول لهذه الحلقة' },
        { status: 403 }
      );
    }

    // بناء الفلتر
    const where: any = {
      courseId,
    };

    // إذا كانت طالبة، فقط درجاتها
    if (role === 'STUDENT') {
      where.studentId = userId;
    } else if (studentId) {
      // إذا محدد studentId معين (للمعلمة/المدير)
      where.studentId = studentId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // جلب الدرجات اليومية
    const dailyGrades = await db.dailyGrade.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { student: { studentName: 'asc' } },
      ],
    });

    // حساب الإجمالي (مجموع خام)
    const totalMemorization = dailyGrades.reduce(
      (sum: number, g: any) => sum + Number(g.memorization),
      0
    );
    const totalReview = dailyGrades.reduce(
      (sum: number, g: any) => sum + Number(g.review),
      0
    );
    const grandTotal = totalMemorization + totalReview;

    return NextResponse.json({
      dailyGrades,
      summary: {
        totalMemorization,
        totalReview,
        grandTotal,
        count: dailyGrades.length,
      },
    });
  } catch (error: any) {
    console.error('خطأ في جلب الدرجات اليومية:', error);
    return NextResponse.json(
      { error: 'فشل جلب الدرجات اليومية', details: error.message },
      { status: 500 }
    );
  }
}
