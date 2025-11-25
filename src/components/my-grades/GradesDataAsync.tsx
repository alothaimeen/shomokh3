import { db } from '@/lib/db';
import GradesTabs from '@/components/grades/GradesTabs';

interface Grade {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'final' | 'behavior';
  category: string;
  score: number;
  maxScore: number;
  date: string;
  courseName: string;
  teacherName: string;
  notes?: string;
}

interface GradeSummary {
  totalDailyGrades: number;
  totalWeeklyGrades: number;
  totalMonthlyGrades: number;
  finalExamGrade: number;
  behaviorGrade: number;
  totalPoints: number;
  finalPercentage: number;
  taskPoints?: number;
  behaviorPoints?: number;
}

async function getStudentGrades(userId: string): Promise<{ grades: Grade[], summary: GradeSummary }> {
  const student = await db.student.findFirst({
    where: { userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              teacher: { select: { userName: true } },
              program: { select: { programName: true } }
            }
          }
        }
      }
    }
  });

  if (!student) {
    return { grades: [], summary: {
      totalDailyGrades: 0,
      totalWeeklyGrades: 0,
      totalMonthlyGrades: 0,
      finalExamGrade: 0,
      behaviorGrade: 0,
      totalPoints: 0,
      finalPercentage: 0
    }};
  }

  const [dailyGrades, weeklyGrades, monthlyGrades, finalGrades, behaviorGrades] = await Promise.all([
    db.dailyGrade.findMany({
      where: { studentId: student.id },
      include: { course: { include: { teacher: true } } },
      orderBy: { date: 'desc' }
    }),
    db.weeklyGrade.findMany({
      where: { studentId: student.id },
      include: { course: { include: { teacher: true } } },
      orderBy: { week: 'desc' }
    }),
    db.monthlyGrade.findMany({
      where: { studentId: student.id },
      include: { course: { include: { teacher: true } } },
      orderBy: { month: 'desc' }
    }),
    db.finalExam.findMany({
      where: { studentId: student.id },
      include: { course: { include: { teacher: true } } }
    }),
    db.behaviorGrade.findMany({
      where: { studentId: student.id },
      include: { course: { include: { teacher: true } } }
    })
  ]);

  const allGrades: Grade[] = [
    ...dailyGrades.map(g => ({
      id: g.id,
      type: 'daily' as const,
      category: `يوم ${new Date(g.date).toLocaleDateString('ar-SA')}`,
      score: Number(g.memorization) + Number(g.review),
      maxScore: 10,
      date: g.date.toISOString(),
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد',
      notes: g.notes || undefined
    })),
    ...weeklyGrades.map(g => ({
      id: g.id,
      type: 'weekly' as const,
      category: `أسبوع ${g.week}`,
      score: Number(g.grade),
      maxScore: 10,
      date: new Date().toISOString(),
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد',
      notes: g.notes || undefined
    })),
    ...monthlyGrades.map(g => ({
      id: g.id,
      type: 'monthly' as const,
      category: `شهر ${g.month}`,
      score: Number(g.quranForgetfulness) + Number(g.quranMajorMistakes) + Number(g.quranMinorMistakes) + Number(g.tajweedTheory),
      maxScore: 10,
      date: new Date().toISOString(),
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد',
      notes: g.notes || undefined
    })),
    ...finalGrades.map(g => ({
      id: g.id,
      type: 'final' as const,
      category: 'اختبار نهائي',
      score: Number(g.quranTest) + Number(g.tajweedTest),
      maxScore: 50,
      date: new Date().toISOString(),
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد',
      notes: g.notes || undefined
    })),
    ...behaviorGrades.map(g => ({
      id: g.id,
      type: 'behavior' as const,
      category: 'سلوك',
      score: Number(g.dailyScore),
      maxScore: 10,
      date: new Date().toISOString(),
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد',
      notes: g.notes || undefined
    }))
  ];

  const summary: GradeSummary = {
    totalDailyGrades: dailyGrades.reduce((sum, g) => sum + Number(g.memorization) + Number(g.review), 0),
    totalWeeklyGrades: weeklyGrades.reduce((sum, g) => sum + Number(g.grade), 0),
    totalMonthlyGrades: monthlyGrades.reduce((sum, g) => sum + Number(g.quranForgetfulness) + Number(g.quranMajorMistakes) + Number(g.quranMinorMistakes) + Number(g.tajweedTheory), 0),
    finalExamGrade: finalGrades.reduce((sum, g) => sum + Number(g.quranTest) + Number(g.tajweedTest), 0),
    behaviorGrade: behaviorGrades.reduce((sum, g) => sum + Number(g.dailyScore), 0),
    totalPoints: 0,
    finalPercentage: 0
  };

  summary.totalPoints = summary.totalDailyGrades + summary.totalWeeklyGrades + 
                        summary.totalMonthlyGrades + summary.finalExamGrade + summary.behaviorGrade;
  summary.finalPercentage = (summary.totalPoints / 100) * 100;

  return { grades: allGrades, summary };
}

interface GradesDataAsyncProps {
  userId: string;
}

export default async function GradesDataAsync({ userId }: GradesDataAsyncProps) {
  const { grades, summary } = await getStudentGrades(userId);

  if (grades.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">لا توجد درجات مسجلة بعد</p>
      </div>
    );
  }

  return (
    <>
      {/* ملخص الدرجات */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">ملخص الدرجات</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{summary.totalDailyGrades}</div>
            <div className="text-sm text-blue-600">يومي</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{summary.totalWeeklyGrades}</div>
            <div className="text-sm text-green-600">أسبوعي</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">{summary.totalMonthlyGrades}</div>
            <div className="text-sm text-purple-600">شهري</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">{summary.finalExamGrade}</div>
            <div className="text-sm text-red-600">نهائي</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">{summary.behaviorGrade}</div>
            <div className="text-sm text-orange-600">سلوك</div>
          </div>
        </div>
      </div>

      {/* درجاتي بالتفصيل */}
      <GradesTabs grades={grades} summary={summary} />
    </>
  );
}
