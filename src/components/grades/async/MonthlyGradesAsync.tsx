import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTeacherCourses, getMonthlyGrades } from '@/lib/data/queries';
import MonthlyGradesForm from '@/components/grades/MonthlyGradesForm';
import CourseSelector from '@/components/grades/CourseSelector';
import MonthSelector from '@/components/grades/MonthSelector';

interface Props {
  courseId: string;
  month: number;
}

export default async function MonthlyGradesAsync({ courseId, month }: Props) {
  const session = await auth();
  
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined;
  const courses = teacherId ? await getTeacherCourses(teacherId) : [];

  const selectedCourseId = courseId || (courses[0]?.id ?? '');

  let students: any[] = [];
  let courseName = '';

  if (selectedCourseId) {
    students = await getMonthlyGrades(selectedCourseId);
    const course = courses.find((c) => c.id === selectedCourseId);
    courseName = course?.courseName || '';
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CourseSelector 
            courses={courses}
            selectedCourseId={selectedCourseId}
            pageType="monthly"
          />
          <MonthSelector 
            selectedMonth={month}
            courseId={selectedCourseId}
          />
        </div>
      </div>

      {selectedCourseId ? (
        <MonthlyGradesForm
          students={students}
          selectedMonth={month}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          يرجى اختيار الحلقة لعرض الطالبات
        </div>
      )}
    </>
  );
}
