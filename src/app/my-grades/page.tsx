import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
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
      include: { course: { include: { teacher: true } } },
      orderBy: { date: 'desc' }
    })
  ]);

  const grades: Grade[] = [
    ...dailyGrades.map(g => ({
      id: g.id,
      type: 'daily' as const,
      category: 'الحفظ اليومي',
      score: Number(g.memorization) + Number(g.review),
      maxScore: 20,
      date: g.date.toISOString().split('T')[0],
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد',
      notes: g.notes || undefined
    })),
    ...weeklyGrades.map(g => ({
      id: g.id,
      type: 'weekly' as const,
      category: `الأسبوع ${g.week}`,
      score: Number(g.grade),
      maxScore: 25,
      date: new Date().toISOString().split('T')[0],
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد'
    })),
    ...monthlyGrades.map(g => ({
      id: g.id,
      type: 'monthly' as const,
      category: `الشهر ${g.month}`,
      score: Number(g.quranForgetfulness) + Number(g.quranMajorMistakes) + Number(g.quranMinorMistakes) + Number(g.tajweedTheory),
      maxScore: 30,
      date: new Date().toISOString().split('T')[0],
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد'
    })),
    ...finalGrades.map(g => ({
      id: g.id,
      type: 'final' as const,
      category: 'الاختبار النهائي',
      score: Number(g.quranTest) + Number(g.tajweedTest),
      maxScore: 60,
      date: new Date().toISOString().split('T')[0],
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد'
    })),
    ...behaviorGrades.map(g => ({
      id: g.id,
      type: 'behavior' as const,
      category: 'السلوك',
      score: Number(g.dailyScore),
      maxScore: 1,
      date: g.date.toISOString().split('T')[0],
      courseName: g.course.courseName,
      teacherName: g.course.teacher?.userName || 'غير محدد',
      notes: g.notes || undefined
    }))
  ];

  const summary: GradeSummary = {
    totalDailyGrades: dailyGrades.reduce((sum, g) => sum + Number(g.memorization) + Number(g.review), 0),
    totalWeeklyGrades: weeklyGrades.reduce((sum, g) => sum + Number(g.grade), 0),
    totalMonthlyGrades: monthlyGrades.reduce((sum, g) => 
      sum + Number(g.quranForgetfulness) + Number(g.quranMajorMistakes) + 
      Number(g.quranMinorMistakes) + Number(g.tajweedTheory), 0),
    finalExamGrade: finalGrades.reduce((sum, g) => sum + Number(g.quranTest) + Number(g.tajweedTest), 0),
    behaviorGrade: behaviorGrades.reduce((sum, g) => sum + Number(g.dailyScore), 0),
    totalPoints: 0,
    finalPercentage: 0
  };

  summary.totalPoints = summary.totalDailyGrades + summary.totalWeeklyGrades + 
                        summary.totalMonthlyGrades + summary.finalExamGrade + summary.behaviorGrade;
  summary.finalPercentage = summary.totalPoints > 0 ? (summary.totalPoints / 600) * 100 : 0;

  return { grades, summary };
}

export default async function MyGradesPage() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  const { grades, summary } = await getStudentGrades(session.user.id);

  return (
    <div className="min-h-screen flex bg-gray-50" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader title="درجاتي" />
        <main className="flex-1 overflow-auto p-6">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            درجاتي
          </h1>
          <p className="text-gray-600 mb-6">عرض تفصيلي لجميع درجاتك ونقاطك التحفيزية</p>

          <GradesTabs grades={grades} summary={summary} />
        </main>
      </div>
    </div>
  );
}
