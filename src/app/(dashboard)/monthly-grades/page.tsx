import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTeacherCourses, getMonthlyGrades } from '@/lib/data/queries';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import MonthlyGradesForm from '@/components/grades/MonthlyGradesForm';
import CourseSelector from '@/components/grades/CourseSelector';
import MonthSelector from '@/components/grades/MonthSelector';

interface PageProps {
  searchParams: Promise<{ courseId?: string; month?: string }>;
}

export default async function MonthlyGradesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/login');
  }

  const params = await searchParams;
  const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined;
  const courses = teacherId ? await getTeacherCourses(teacherId) : [];

  const selectedCourseId = params.courseId || (courses[0]?.id ?? '');
  const selectedMonth = parseInt(params.month || '1');

  let students: any[] = [];
  let courseName = '';

  if (selectedCourseId) {
    students = await getMonthlyGrades(selectedCourseId);
    const course = courses.find((c) => c.id === selectedCourseId);
    courseName = course?.courseName || '';
  }

  return (
    <>
      <AppHeader title="الدرجات الشهرية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            📊 الدرجات الشهرية
          </h1>
          <p className="text-gray-600 mb-6">إدخال درجات الشهر (نسيان + لحن جلي + لحن خفي + تجويد نظري)</p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CourseSelector 
                courses={courses}
                selectedCourseId={selectedCourseId}
                currentMonth={selectedMonth}
                pageType="monthly"
              />
              <MonthSelector 
                selectedMonth={selectedMonth}
                courseId={selectedCourseId}
              />
            </div>

            {courseName && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-md">
                <p className="text-sm text-indigo-700">
                  <strong>الحلقة:</strong> {courseName} | <strong>الشهر:</strong> {selectedMonth}
                </p>
              </div>
            )}
          </div>

          {students.length > 0 ? (
            <MonthlyGradesForm students={students} selectedMonth={selectedMonth} />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">لا توجد طالبات مسجلات</p>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              💡 درجة كل شهر: 30 (5+5+5+15) | المجموع الكامل لـ 3 أشهر: 90 درجة
            </p>
          </div>
        </div>
    </>
  );
}
