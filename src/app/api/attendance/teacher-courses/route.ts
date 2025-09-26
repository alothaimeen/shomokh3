import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER', 'TEACHER'].includes(session.user.userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    let courses;

    if (session.user.userRole === 'TEACHER') {
      // المعلمة ترى حلقاتها فقط
      courses = await prisma.course.findMany({
        where: {
          teacherId: session.user.id,
          isActive: true,
        },
        include: {
          program: {
            select: {
              id: true,
              programName: true,
            },
          },
          _count: {
            select: {
              enrollments: {
                where: { isActive: true },
              },
            },
          },
        },
        orderBy: {
          courseName: 'asc',
        },
      });
    } else {
      // الإدارة ترى كل الحلقات
      courses = await prisma.course.findMany({
        where: {
          isActive: true,
        },
        include: {
          program: {
            select: {
              id: true,
              programName: true,
            },
          },
          teacher: {
            select: {
              id: true,
              userName: true,
            },
          },
          _count: {
            select: {
              enrollments: {
                where: { isActive: true },
              },
            },
          },
        },
        orderBy: {
          courseName: 'asc',
        },
      });
    }

    return NextResponse.json({ courses });

  } catch (error) {
    console.error('خطأ في الحصول على الحلقات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الحصول على الحلقات' },
      { status: 500 }
    );
  }
}