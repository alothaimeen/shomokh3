import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTeacherCourses, getWeeklyGrades } from '@/lib/data/queries';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import WeeklyGradesForm from '@/components/grades/WeeklyGradesForm';
import CourseSelector from '@/components/grades/CourseSelector';
import WeekSelector from '@/components/grades/WeekSelector';

interface PageProps {
  searchParams: Promise<{ courseId?: string; week?: string }>;
}

export default async function WeeklyGradesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/login');
  }

  const params = await searchParams;
  const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined;
  const courses = teacherId ? await getTeacherCourses(teacherId) : [];

  const selectedCourseId = params.courseId || (courses[0]?.id ?? '');
  const selectedWeek = parseInt(params.week || '1');

  let students: any[] = [];
  let courseName = '';

  if (selectedCourseId) {
    students = await getWeeklyGrades(selectedCourseId);
    const course = courses.find((c) => c.id === selectedCourseId);
    courseName = course?.courseName || '';
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="الدرجات الأسبوعية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            📊 الدرجات الأسبوعية
          </h1>
          <p className="text-gray-600 mb-6">إدخال درجات الأسبوع (0-5 لكل أسبوع)</p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CourseSelector 
                courses={courses}
                selectedCourseId={selectedCourseId}
                currentWeek={selectedWeek}
                pageType="weekly"
              />
              <WeekSelector 
                selectedWeek={selectedWeek}
                courseId={selectedCourseId}
              />
            </div>

            {courseName && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-md">
                <p className="text-sm text-indigo-700">
                  <strong>الحلقة:</strong> {courseName} | <strong>الأسبوع:</strong> {selectedWeek}
                </p>
              </div>
            )}
          </div>

          {students.length > 0 ? (
            <WeeklyGradesForm students={students} selectedWeek={selectedWeek} />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">لا توجد طالبات مسجلات</p>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              💡 درجة كل أسبوع: 5 | المجموع الكامل لـ 10 أسابيع: 50 درجة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
