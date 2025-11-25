import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTeacherCourses, getCourseEnrollments, getDailyGrades } from '@/lib/data/queries';
import DailyGradesForm from '@/components/grades/DailyGradesForm';
import CourseSelector from '@/components/grades/CourseSelector';
import DateSelector from '@/components/grades/DateSelector';

interface Props {
  courseId: string;
  date: string;
}

export default async function DailyGradesAsync({ courseId, date }: Props) {
  const session = await auth();
  
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined;
  const courses = teacherId ? await getTeacherCourses(teacherId) : [];
  
  const selectedCourseId = courseId || (courses[0]?.id ?? '');

  let students: any[] = [];
  let existingGrades: any[] = [];

  if (selectedCourseId) {
    const enrollments = await getCourseEnrollments(selectedCourseId);
    students = enrollments.map(e => ({
      id: e.student.id,
      studentName: e.student.studentName,
      studentNumber: e.student.studentNumber || 0,
    }));

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
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
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <CourseSelector 
          courses={courses}
          selectedCourseId={selectedCourseId}
          currentDate={date}
          pageType="daily"
        />
        <DateSelector 
          selectedDate={date}
          courseId={selectedCourseId}
          pageType="daily"
        />
      </div>

      {selectedCourseId ? (
        <DailyGradesForm
          students={students}
          existingGrades={existingGrades}
          courseId={selectedCourseId}
          selectedDate={date}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          يرجى اختيار الحلقة لعرض الطالبات
        </div>
      )}
    </>
  );
}
