import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'MANAGER', 'TEACHER'].includes(session.user.userRole)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
    }

    // إرجاع بيانات اختبار للحلقات
    const sampleCourses = [
      {
        id: 'course-1',
        courseName: 'حلقة الفجر',
        level: 1,
        maxStudents: 15,
        isActive: true,
        program: {
          id: 'prog-1',
          programName: 'برنامج الحفظ المكثف',
        },
        teacher: {
          id: 'teacher-1',
          userName: 'المعلمة سارة',
        },
        _count: {
          enrollments: 12,
        },
      },
      {
        id: 'course-2',
        courseName: 'حلقة المغرب',
        level: 2,
        maxStudents: 20,
        isActive: true,
        program: {
          id: 'prog-2',
          programName: 'برنامج التجويد المتقدم',
        },
        teacher: {
          id: 'teacher-2',
          userName: 'المعلمة نورا',
        },
        _count: {
          enrollments: 8,
        },
      },
      {
        id: 'course-3',
        courseName: 'حلقة العشاء',
        level: 1,
        maxStudents: 15,
        isActive: true,
        program: {
          id: 'prog-1',
          programName: 'برنامج الحفظ المكثف',
        },
        teacher: {
          id: 'teacher-3',
          userName: 'المعلمة ريم',
        },
        _count: {
          enrollments: 10,
        },
      }
    ];

    return NextResponse.json({ courses: sampleCourses });

  } catch (error) {
    console.error('خطأ في الحصول على الحلقات:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الحصول على الحلقات' },
      { status: 500 }
    );
  }
}