import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    // بناء شرط WHERE حسب دور المستخدم
    let whereCondition: any = { isActive: true };
    if (session.user.userRole === 'TEACHER') {
      whereCondition = {
        ...whereCondition,
        teacher: {
          userEmail: session.user.email,
        }
      };
    }
    // للـ ADMIN، جلب جميع الحلقات النشطة

    const courses = await db.course.findMany({
      where: whereCondition,
      include: {
        program: {
          select: {
            id: true,
            programName: true,
          }
        },
        teacher: {
          select: {
            id: true,
            userName: true,
          }
        },
        _count: {
          select: {
            enrollments: true,
          }
        }
      },
      orderBy: {
        courseName: 'asc'
      }
    });

    return NextResponse.json({ courses });

  } catch (error) {
    console.error('خطأ في الحصول على الحلقات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الحصول على الحلقات' },
      { status: 500 }
    );
  }
}