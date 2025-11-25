import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTeacherCourses, getWeeklyGrades } from '@/lib/data/queries';
import WeeklyGradesForm from '@/components/grades/WeeklyGradesForm';
import CourseSelector from '@/components/grades/CourseSelector';
import WeekSelector from '@/components/grades/WeekSelector';

interface Props {
  courseId: string;
  week: number;
}

export default async function WeeklyGradesAsync({ courseId, week }: Props) {
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
    students = await getWeeklyGrades(selectedCourseId);
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
            pageType="weekly"
          />
          <WeekSelector 
            selectedWeek={week}
            courseId={selectedCourseId}
          />
        </div>
      </div>

      {selectedCourseId ? (
        <WeeklyGradesForm
          students={students}
          selectedWeek={week}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          يرجى اختيار الحلقة لعرض الطالبات
        </div>
      )}
    </>
  );
}
