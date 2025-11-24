import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import AcademicReportsViewer from '@/components/academic-reports/AcademicReportsViewer';

interface SearchParams {
  courseId?: string;
}

export default async function AcademicReportsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth();

  if (!session?.user || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  let selectedCourseId = params.courseId;

  // جلب الحلقات
  const whereClause: any = session.user.role === 'TEACHER' 
    ? { teacherId: session.user.id }
    : {};

  const courses = await db.course.findMany({
    where: whereClause,
    include: {
      program: { select: { programName: true } }
    },
    orderBy: { courseName: 'asc' }
  });

  if (!selectedCourseId && courses.length > 0) {
    selectedCourseId = courses[0].id;
  }

  const coursesData = courses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    programName: c.program.programName
  }));

  // جلب التقارير إذا تم اختيار حلقة
  let reports: any[] = [];
  if (selectedCourseId) {
    const enrollments = await db.enrollment.findMany({
      where: { courseId: selectedCourseId },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            studentName: true
          }
        }
      },
      orderBy: { student: { studentNumber: 'asc' } }
    });

    // جلب الدرجات لكل طالبة
    reports = await Promise.all(
      enrollments.map(async (enrollment) => {
        const [dailyGrades, weeklyGrades, monthlyGrades, behaviorGrades, finalExam] = await Promise.all([
          db.dailyGrade.findMany({
            where: { studentId: enrollment.studentId, courseId: selectedCourseId }
          }),
          db.weeklyGrade.findMany({
            where: { studentId: enrollment.studentId, courseId: selectedCourseId }
          }),
          db.monthlyGrade.findMany({
            where: { studentId: enrollment.studentId, courseId: selectedCourseId }
          }),
          db.behaviorGrade.findMany({
            where: { studentId: enrollment.studentId, courseId: selectedCourseId }
          }),
          db.finalExam.findFirst({
            where: { studentId: enrollment.studentId, courseId: selectedCourseId }
          })
        ]);

        const dailyRaw = dailyGrades.reduce((sum, g) => sum + Number(g.memorization) + Number(g.review), 0);
        const weeklyRaw = weeklyGrades.reduce((sum, g) => sum + Number(g.grade), 0);
        const monthlyRaw = monthlyGrades.reduce((sum, g) => {
          const forget = Number(g.quranForgetfulness);
          const major = Number(g.quranMajorMistakes);
          const minor = Number(g.quranMinorMistakes);
          const theory = Number(g.tajweedTheory);
          return sum + forget + major + minor + theory;
        }, 0);
        const behaviorRaw = behaviorGrades.reduce((sum, g) => sum + Number(g.dailyScore), 0);
        const finalExamRaw = finalExam ? Number(finalExam.quranTest) + Number(finalExam.tajweedTest) : 0;

        // الحساب النهائي (من 100)
        const daily = dailyRaw * 0.20;      // 20%
        const weekly = weeklyRaw * 0.20;     // 20%
        const monthly = monthlyRaw * 0.20;   // 20%
        const behavior = behaviorRaw * 0.10; // 10%
        const finalExamScore = finalExamRaw * 0.30; // 30%

        const total = daily + weekly + monthly + behavior + finalExamScore;
        const percentage = Math.round((total / 100) * 100);

        return {
          studentId: enrollment.student.studentNumber,
          studentName: enrollment.student.studentName,
          grades: {
            dailyRaw,
            weeklyRaw,
            monthlyRaw,
            behaviorRaw,
            finalExamRaw,
            daily: Math.round(daily * 10) / 10,
            weekly: Math.round(weekly * 10) / 10,
            monthly: Math.round(monthly * 10) / 10,
            behavior: Math.round(behavior * 10) / 10,
            finalExam: Math.round(finalExamScore * 10) / 10,
            total: Math.round(total * 10) / 10,
            percentage
          }
        };
      })
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="التقارير الأكاديمية" />
        <div className="p-8">
          <BackButton />
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">التقرير الشامل للدرجات</h1>
            <p className="text-gray-600">عرض تفصيلي لجميع درجات الطالبات والحساب النهائي</p>
          </div>

          <AcademicReportsViewer 
            courses={coursesData}
            reports={reports}
            selectedCourseId={selectedCourseId || ''}
          />
        </div>
      </div>
    </div>
  );
}
