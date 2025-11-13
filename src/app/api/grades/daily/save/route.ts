import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkCourseOwnership } from '@/lib/course-ownership';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    // التحقق من الجلسة
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    const { id: userId, role } = session.user;

    // قراءة البيانات
    const body = await request.json();
    const { grades, courseId } = body;

    if (!courseId || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة. يجب إرسال courseId ومصفوفة grades' },
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

    // حفظ الدرجات (upsert: تحديث إذا موجود، إنشاء إذا جديد)
    const savedGrades = [];
    for (const grade of grades) {
      const { studentId, date, memorization, review, notes } = grade;

      if (!studentId) {
        continue; // تجاهل السجلات غير المكتملة
      }

      // التحقق من أن الطالبة مسجلة في الحلقة
      const enrollment = await db.enrollment.findFirst({
        where: {
          studentId,
          courseId,
          isActive: true,
        },
      });

      if (!enrollment) {
        console.warn(`⚠️ الطالبة ${studentId} غير مسجلة في الحلقة ${courseId}`);
        continue;
      }

      // تحويل القيم إلى Decimal
      const memorizationDecimal = new Decimal(memorization || 0);
      const reviewDecimal = new Decimal(review || 0);

      // تطبيع التاريخ (بداية اليوم فقط - تجاهل الوقت)
      const gradeDate = new Date(date || new Date());
      gradeDate.setHours(0, 0, 0, 0);

      // upsert: تحديث إذا موجود، إنشاء إذا جديد
      const saved = await db.dailyGrade.upsert({
        where: {
          studentId_courseId_date: {
            studentId,
            courseId,
            date: gradeDate,
          },
        },
        update: {
          memorization: memorizationDecimal,
          review: reviewDecimal,
          notes: notes || null,
          updatedAt: new Date(),
        },
        create: {
          studentId,
          courseId,
          date: gradeDate,
          memorization: memorizationDecimal,
          review: reviewDecimal,
          notes: notes || null,
        },
      });

      savedGrades.push(saved);
    }

    return NextResponse.json({
      success: true,
      message: `تم حفظ ${savedGrades.length} درجة يومية بنجاح`,
      savedGrades,
    });
  } catch (error: any) {
    console.error('خطأ في حفظ الدرجات اليومية:', error);
    return NextResponse.json(
      { error: 'فشل حفظ الدرجات اليومية', details: error.message },
      { status: 500 }
    );
  }
}
