import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: جلب الدرجات الأسبوعية لحلقة معينة
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "غير مصادق عليه" }, { status: 401 });
    }

    // فقط ADMIN و TEACHER يمكنهم رؤية الدرجات
    if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "معرف الحلقة مطلوب" },
        { status: 400 }
      );
    }

    // التحقق من ملكية الحلقة للمعلمة
    if (session.user.role === "TEACHER") {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true },
      });

      if (!course || course.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: "غير مصرح بالوصول لهذه الحلقة" },
          { status: 403 }
        );
      }
    }

    // جلب جميع الطالبات المسجلات مع درجاتهم الأسبوعية
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId,
        isActive: true,
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
          },
        },
        course: {
          select: {
            id: true,
            courseName: true,
          },
        },
      },
    });

    // جلب جميع الدرجات الأسبوعية للحلقة
    const weeklyGrades = await db.weeklyGrade.findMany({
      where: { courseId },
    });

    // تنظيم البيانات: طالبة واحدة × 10 أسابيع
    const studentsWithGrades = enrollments.map((enrollment) => {
      const grades: { [week: number]: number } = {};
      
      // ملء الدرجات الموجودة
      weeklyGrades
        .filter((g) => g.studentId === enrollment.student.id)
        .forEach((g) => {
          grades[g.week] = Number(g.grade);
        });

      // ملء الدرجات الفارغة بـ 0
      for (let week = 1; week <= 10; week++) {
        if (!(week in grades)) {
          grades[week] = 0;
        }
      }

      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.student.id,
        studentName: enrollment.student.studentName,
        studentNumber: enrollment.student.studentNumber,
        grades, // { 1: 5, 2: 4.5, 3: 0, ... }
        total: Object.values(grades).reduce((sum, g) => sum + g, 0),
      };
    });

    return NextResponse.json({
      course: enrollments[0]?.course || null,
      students: studentsWithGrades,
    });
  } catch (error) {
    console.error("خطأ في جلب الدرجات الأسبوعية:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}

// POST: حفظ الدرجات الأسبوعية (upsert جماعي)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "غير مصادق عليه" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, week, grades } = body;

    // التحقق من البيانات
    if (!courseId || !week || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    if (week < 1 || week > 10) {
      return NextResponse.json(
        { error: "رقم الأسبوع يجب أن يكون بين 1 و 10" },
        { status: 400 }
      );
    }

    // التحقق من ملكية الحلقة للمعلمة
    if (session.user.role === "TEACHER") {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true },
      });

      if (!course || course.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: "غير مصرح بالوصول لهذه الحلقة" },
          { status: 403 }
        );
      }
    }

    // حفظ الدرجات (upsert)
    const savePromises = grades.map(
      async (item: { studentId: string; grade: number }) => {
        const gradeValue = Number(item.grade);
        
        // التحقق من صحة الدرجة
        if (gradeValue < 0 || gradeValue > 5) {
          throw new Error(`درجة غير صحيحة: ${gradeValue}`);
        }

        return db.weeklyGrade.upsert({
          where: {
            studentId_courseId_week: {
              studentId: item.studentId,
              courseId,
              week,
            },
          },
          update: {
            grade: gradeValue,
            updatedAt: new Date(),
          },
          create: {
            id: `wg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentId: item.studentId,
            courseId,
            week,
            grade: gradeValue,
          },
        });
      }
    );

    await Promise.all(savePromises);

    return NextResponse.json({
      success: true,
      message: `تم حفظ درجات الأسبوع ${week} بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في حفظ الدرجات الأسبوعية:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ البيانات" },
      { status: 500 }
    );
  }
}
