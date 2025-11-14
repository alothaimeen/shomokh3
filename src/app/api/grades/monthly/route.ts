import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: جلب الدرجات الشهرية لحلقة معينة
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

    // جلب جميع الطالبات المسجلات مع درجاتهم الشهرية
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

    // جلب جميع الدرجات الشهرية للحلقة
    const monthlyGrades = await db.monthlyGrade.findMany({
      where: { courseId },
    });

    // تنظيم البيانات: طالبة واحدة × 3 أشهر
    const studentsWithGrades = enrollments.map((enrollment) => {
      const grades: {
        [month: number]: {
          quranForgetfulness: number;
          quranMajorMistakes: number;
          quranMinorMistakes: number;
          tajweedTheory: number;
          total: number;
        };
      } = {};

      // ملء الدرجات الموجودة
      monthlyGrades
        .filter((g: any) => g.studentId === enrollment.student.id)
        .forEach((g: any) => {
          const quranTotal =
            Number(g.quranForgetfulness) +
            Number(g.quranMajorMistakes) +
            Number(g.quranMinorMistakes);
          const tajweedTotal = Number(g.tajweedTheory);

          grades[g.month] = {
            quranForgetfulness: Number(g.quranForgetfulness),
            quranMajorMistakes: Number(g.quranMajorMistakes),
            quranMinorMistakes: Number(g.quranMinorMistakes),
            tajweedTheory: Number(g.tajweedTheory),
            total: quranTotal + tajweedTotal,
          };
        });

      // ملء الأشهر الفارغة بـ 0
      for (let month = 1; month <= 3; month++) {
        if (!(month in grades)) {
          grades[month] = {
            quranForgetfulness: 0,
            quranMajorMistakes: 0,
            quranMinorMistakes: 0,
            tajweedTheory: 0,
            total: 0,
          };
        }
      }

      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.student.id,
        studentName: enrollment.student.studentName,
        studentNumber: enrollment.student.studentNumber,
        grades, // { 1: {...}, 2: {...}, 3: {...} }
        total:
          grades[1].total +
          grades[2].total +
          grades[3].total,
      };
    });

    return NextResponse.json({
      course: enrollments[0]?.course || null,
      students: studentsWithGrades,
    });
  } catch (error) {
    console.error("خطأ في جلب الدرجات الشهرية:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}

// POST: حفظ الدرجات الشهرية (upsert جماعي)
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
    const { courseId, month, grades } = body;

    // التحقق من البيانات
    if (!courseId || !month || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    if (month < 1 || month > 3) {
      return NextResponse.json(
        { error: "رقم الشهر يجب أن يكون بين 1 و 3" },
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
      async (item: {
        studentId: string;
        quranForgetfulness: number;
        quranMajorMistakes: number;
        quranMinorMistakes: number;
        tajweedTheory: number;
      }) => {
        const quranForgetfulness = Number(item.quranForgetfulness);
        const quranMajorMistakes = Number(item.quranMajorMistakes);
        const quranMinorMistakes = Number(item.quranMinorMistakes);
        const tajweedTheory = Number(item.tajweedTheory);

        // التحقق من صحة الدرجات
        if (
          quranForgetfulness < 0 || quranForgetfulness > 5 ||
          quranMajorMistakes < 0 || quranMajorMistakes > 5 ||
          quranMinorMistakes < 0 || quranMinorMistakes > 5 ||
          tajweedTheory < 0 || tajweedTheory > 15
        ) {
          throw new Error("درجة غير صحيحة في البيانات");
        }

        return db.monthlyGrade.upsert({
          where: {
            studentId_courseId_month: {
              studentId: item.studentId,
              courseId,
              month,
            },
          },
          update: {
            quranForgetfulness,
            quranMajorMistakes,
            quranMinorMistakes,
            tajweedTheory,
            updatedAt: new Date(),
          },
          create: {
            id: `mg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            studentId: item.studentId,
            courseId,
            month,
            quranForgetfulness,
            quranMajorMistakes,
            quranMinorMistakes,
            tajweedTheory,
          },
        });
      }
    );

    await Promise.all(savePromises);

    return NextResponse.json({
      success: true,
      message: `تم حفظ درجات الشهر ${month} بنجاح`,
    });
  } catch (error) {
    console.error("خطأ في حفظ الدرجات الشهرية:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ البيانات" },
      { status: 500 }
    );
  }
}
