import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// بيانات احتياطية للدرجات
function getFallbackGrades() {
  return [
    {
      id: "1",
      type: "daily",
      category: "حفظ القرآن",
      score: 2.5,
      maxScore: 2.5,
      date: "2025-01-15",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة",
      notes: "ممتاز"
    },
    {
      id: "2",
      type: "daily",
      category: "التجويد",
      score: 2.0,
      maxScore: 2.5,
      date: "2025-01-15",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة",
      notes: "يحتاج تحسن"
    },
    {
      id: "3",
      type: "daily",
      category: "مراجعة القرآن",
      score: 2.5,
      maxScore: 2.5,
      date: "2025-01-14",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "4",
      type: "daily",
      category: "مراجعة التجويد",
      score: 2.0,
      maxScore: 2.5,
      date: "2025-01-14",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "5",
      type: "weekly",
      category: "المراجعة الأسبوعية",
      score: 4.5,
      maxScore: 5.0,
      date: "2025-01-14",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "6",
      type: "weekly",
      category: "المراجعة الأسبوعية",
      score: 4.0,
      maxScore: 5.0,
      date: "2025-01-07",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "7",
      type: "monthly",
      category: "القرآن الكريم",
      score: 14,
      maxScore: 15,
      date: "2025-01-10",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "8",
      type: "monthly",
      category: "التجويد النظري",
      score: 14,
      maxScore: 15,
      date: "2025-01-10",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "9",
      type: "final",
      category: "اختبار القرآن النهائي",
      score: 37,
      maxScore: 40,
      date: "2025-01-05",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "10",
      type: "final",
      category: "اختبار التجويد النهائي",
      score: 18,
      maxScore: 20,
      date: "2025-01-05",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    },
    {
      id: "11",
      type: "behavior",
      category: "السلوك والمواظبة",
      score: 9,
      maxScore: 10,
      date: "2025-01-15",
      courseName: "حلقة الفجر",
      teacherName: "المعلمة سارة"
    }
  ];
}

function getFallbackSummary() {
  return {
    totalDailyGrades: 315, // من أصل 700 (70 يوم × 10)
    totalWeeklyGrades: 42.5, // من أصل 50 (10 أسابيع × 5)
    totalMonthlyGrades: 84, // من أصل 90 (3 شهور × 30)
    finalExamGrade: 55, // من أصل 60
    behaviorGrade: 63, // من أصل 70
    totalPoints: 559.5, // المجموع الخام
    finalPercentage: 86.2 // النسبة المئوية النهائية من 200 درجة
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || session.user.userRole !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب البيانات الحقيقية من قاعدة البيانات
    try {
      // البحث عن الطالبة
      const student = await db.student.findFirst({
        where: {
          studentName: {
            contains: session.user.name || ''
          }
        }
      });

      if (!student) {
        return NextResponse.json({
          grades: [],
          summary: null,
          message: 'لم يتم العثور على بيانات الطالبة'
        });
      }

      // جلب التسجيلات النشطة
      const enrollments = await db.enrollment.findMany({
        where: {
          studentId: student.id,
          isActive: true
        },
        include: {
          course: {
            include: {
              teacher: true,
              program: true
            }
          }
        }
      });

      if (enrollments.length === 0) {
        return NextResponse.json({
          grades: [],
          summary: null,
          message: 'لم تسجلي في أي حلقة بعد'
        });
      }

      const allGrades: any[] = [];

      // جلب الدرجات اليومية
      for (const enrollment of enrollments) {
        const dailyGrades = await db.dailyGrade.findMany({
          where: {
            studentId: student.id,
            courseId: enrollment.courseId
          },
          orderBy: { date: 'desc' },
          take: 20 // آخر 20 درجة يومية
        });

        allGrades.push(...dailyGrades.map(g => ({
          id: g.id,
          type: 'daily' as const,
          category: 'حفظ ومراجعة',
          score: parseFloat(g.memorization.toString()) + parseFloat(g.review.toString()),
          maxScore: 10,
          memorizationScore: parseFloat(g.memorization.toString()),
          reviewScore: parseFloat(g.review.toString()),
          date: g.date.toISOString().split('T')[0],
          courseName: enrollment.course.courseName,
          teacherName: enrollment.course.teacher?.userName || 'غير محدد'
        })));
      }

      // جلب الدرجات الأسبوعية
      for (const enrollment of enrollments) {
        const weeklyGrades = await (db as any).weeklyGrade.findMany({
          where: {
            studentId: student.id,
            courseId: enrollment.courseId
          },
          orderBy: { week: 'desc' }
        });

        allGrades.push(...weeklyGrades.map((g: any) => ({
          id: g.id,
          type: 'weekly' as const,
          category: `الأسبوع ${g.week}`,
          score: parseFloat(g.grade.toString()),
          maxScore: 5,
          date: g.createdAt.toISOString().split('T')[0],
          courseName: enrollment.course.courseName,
          teacherName: enrollment.course.teacher?.userName || 'غير محدد'
        })));
      }

      // جلب الدرجات الشهرية
      for (const enrollment of enrollments) {
        const monthlyGrades = await (db as any).monthlyGrade.findMany({
          where: {
            studentId: student.id,
            courseId: enrollment.courseId
          },
          orderBy: { month: 'desc' }
        });

        const monthlyTotal = (g: any) => 
          parseFloat(g.quranForgetfulness.toString()) +
          parseFloat(g.quranMajorMistakes.toString()) +
          parseFloat(g.quranMinorMistakes.toString()) +
          parseFloat(g.tajweedTheory.toString());

        allGrades.push(...monthlyGrades.map((g: any) => ({
          id: g.id,
          type: 'monthly' as const,
          category: `الشهر ${g.month}`,
          score: monthlyTotal(g),
          maxScore: 30,
          date: g.createdAt.toISOString().split('T')[0],
          courseName: enrollment.course.courseName,
          teacherName: enrollment.course.teacher?.userName || 'غير محدد'
        })));
      }

      // حساب الملخص
      const dailyTotal = allGrades
        .filter(g => g.type === 'daily')
        .reduce((sum, g) => sum + g.score, 0);
      
      const weeklyTotal = allGrades
        .filter(g => g.type === 'weekly')
        .reduce((sum, g) => sum + g.score, 0);
      
      const monthlyTotal = allGrades
        .filter(g => g.type === 'monthly')
        .reduce((sum, g) => sum + g.score, 0);

      const summary = {
        totalDailyGrades: dailyTotal,
        totalWeeklyGrades: weeklyTotal,
        totalMonthlyGrades: monthlyTotal,
        finalExamGrade: 0, // سيتم إضافته لاحقاً
        behaviorGrade: 0, // سيتم إضافته لاحقاً
        totalPoints: dailyTotal + weeklyTotal + monthlyTotal,
        finalPercentage: 0 // سيتم حسابه لاحقاً
      };

      return NextResponse.json({
        grades: allGrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        summary
      });

    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);
      // في حالة الخطأ، نرجع بيانات فارغة
      return NextResponse.json({
        grades: [],
        summary: null,
        error: 'خطأ في جلب البيانات'
      });
    }

  } catch (error) {
    console.error('خطأ في جلب درجات الطالبة:', error);
    return NextResponse.json({
      grades: [],
      summary: null,
      error: 'خطأ غير متوقع'
    }, { status: 500 });
  }
}

// دالة حساب ملخص الدرجات
function calculateGradeSummary(grades: any[]) {
  const dailyGrades = grades.filter(g => g.type === 'daily');
  const weeklyGrades = grades.filter(g => g.type === 'weekly');
  const monthlyGrades = grades.filter(g => g.type === 'monthly');
  const finalGrades = grades.filter(g => g.type === 'final');
  const behaviorGrades = grades.filter(g => g.type === 'behavior');

  const totalDailyGrades = dailyGrades.reduce((sum, g) => sum + g.score, 0);
  const totalWeeklyGrades = weeklyGrades.reduce((sum, g) => sum + g.score, 0);
  const totalMonthlyGrades = monthlyGrades.reduce((sum, g) => sum + g.score, 0);
  const finalExamGrade = finalGrades.reduce((sum, g) => sum + g.score, 0);
  const behaviorGrade = behaviorGrades.reduce((sum, g) => sum + g.score, 0);

  const totalPoints = totalDailyGrades + totalWeeklyGrades + totalMonthlyGrades + finalExamGrade + behaviorGrade;

  // حساب النسبة النهائية بناءً على نظام الدرجات
  // التقييم اليومي: 700 ÷ 14 = 50 درجة
  // التقييم الأسبوعي: 50 درجة
  // التقييم الشهري: 90 ÷ 3 = 30 درجة
  // الاختبار النهائي: 60 درجة
  // السلوك: 70 ÷ 7 = 10 درجات
  // المجموع النهائي: 200 درجة

  const finalDailyScore = totalDailyGrades / 14; // من 50
  const finalWeeklyScore = totalWeeklyGrades; // من 50
  const finalMonthlyScore = totalMonthlyGrades / 3; // من 30
  const finalExamScore = finalExamGrade; // من 60
  const finalBehaviorScore = behaviorGrade / 7; // من 10

  const finalTotal = finalDailyScore + finalWeeklyScore + finalMonthlyScore + finalExamScore + finalBehaviorScore;
  const finalPercentage = (finalTotal / 200) * 100;

  return {
    totalDailyGrades,
    totalWeeklyGrades,
    totalMonthlyGrades,
    finalExamGrade,
    behaviorGrade,
    totalPoints,
    finalPercentage: Math.round(finalPercentage * 10) / 10
  };
}