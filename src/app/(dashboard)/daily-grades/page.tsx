import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTeacherCourses, getCourseEnrollments, getDailyGrades } from '@/lib/data/queries';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import DailyGradesForm from '@/components/grades/DailyGradesForm';
import CourseSelector from '@/components/grades/CourseSelector';
import DateSelector from '@/components/grades/DateSelector';

interface PageProps {
  searchParams: Promise<{ courseId?: string; date?: string }>;
}

export default async function DailyGradesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/login');
  }

  const params = await searchParams;
  const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined;
  const courses = teacherId ? await getTeacherCourses(teacherId) : [];
  
  const selectedCourseId = params.courseId || (courses[0]?.id ?? '');
  const selectedDate = params.date || new Date().toISOString().split('T')[0];

  let students: any[] = [];
  let existingGrades: any[] = [];

  if (selectedCourseId) {
    const enrollments = await getCourseEnrollments(selectedCourseId);
    students = enrollments.map(e => ({
      id: e.student.id,
      studentName: e.student.studentName,
      studentNumber: e.student.studentNumber || 0,
    }));

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const grades = await getDailyGrades(
      selectedCourseId,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );

    existingGrades = grades.map(g => ({
      studentId: g.studentId,
      memorization: Number(g.memorization),
      review: Number(g.review),
      notes: g.notes || '',
    }));
  }

  return (
    <>
      <AppHeader title="الدرجات اليومية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            📊 التقييم اليومي
          </h1>
          <p className="text-gray-600 mb-6">
            إدخال درجات التقييم اليومي للطالبات (حفظ وتجويد + مراجعة وتجويد)
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <CourseSelector 
              courses={courses}
              selectedCourseId={selectedCourseId}
              currentDate={selectedDate}
              pageType="daily"
            />
            <DateSelector 
              selectedDate={selectedDate}
              courseId={selectedCourseId}
              pageType="daily"
            />
          </div>

          <DailyGradesForm
            students={students}
            courseId={selectedCourseId}
            selectedDate={selectedDate}
            existingGrades={existingGrades}
          />
        </div>
    </>
  );
}
