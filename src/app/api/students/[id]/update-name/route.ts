// src/app/api/students/[id]/update-name/route.ts
// API لتعديل أسماء الطالبات - الجلسة 10.6

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    const userRole = session.user.userRole;
    const userId = session.user.id;

    // 2. قراءة الاسم الجديد من الطلب
    const body = await request.json();
    const { studentName } = body;

    if (!studentName || typeof studentName !== 'string' || studentName.trim() === '') {
      return NextResponse.json(
        { error: 'اسم الطالبة مطلوب ويجب أن يكون نصاً غير فارغ' },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const studentId = resolvedParams.id;

    // 3. التحقق من وجود الطالبة
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          where: { isActive: true },
          include: {
            course: {
              select: {
                id: true,
                courseName: true,
                teacherId: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'الطالبة غير موجودة' },
        { status: 404 }
      );
    }

    // 4. فحص الصلاحيات
    let isAuthorized = false;

    if (userRole === 'ADMIN') {
      // ADMIN يمكنه تعديل أي اسم
      isAuthorized = true;
    } else if (userRole === 'TEACHER') {
      // TEACHER يمكنه تعديل أسماء طالباته فقط (المسجلات في حلقاته)
      const teacherCourseIds = student.enrollments
        .map(enrollment => enrollment.course.teacherId)
        .filter(teacherId => teacherId === userId);

      if (teacherCourseIds.length > 0) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'غير مصرح - لا يمكنك تعديل اسم هذه الطالبة' },
        { status: 403 }
      );
    }

    // 5. تحديث اسم الطالبة
    const updatedStudent = await db.student.update({
      where: { id: studentId },
      data: {
        studentName: studentName.trim(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        studentName: true,
        studentNumber: true,
        updatedAt: true
      }
    });

    // 6. إرجاع النتيجة
    return NextResponse.json({
      success: true,
      message: 'تم تحديث اسم الطالبة بنجاح',
      student: updatedStudent
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث اسم الطالبة:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم أثناء تحديث اسم الطالبة' },
      { status: 500 }
    );
  }
}
