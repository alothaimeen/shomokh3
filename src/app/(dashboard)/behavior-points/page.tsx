import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTeacherCourses } from '@/lib/data/queries';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import CourseSelector from '@/components/grades/CourseSelector';
import DateSelector from '@/components/grades/DateSelector';
import StudentsDataAsync from '@/components/behavior-points/StudentsDataAsync';
import StudentsSkeleton from '@/components/behavior-points/StudentsSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string; date?: string }>;
}

export default async function BehaviorPointsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/login');
  }

  const params = await searchParams;
  const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined;
  const courses = teacherId ? await getTeacherCourses(teacherId) : [];

  const selectedCourseId = params.courseId || (courses[0]?.id ?? '');
  const selectedDate = params.date || new Date().toISOString().split('T')[0];

  return (
    <>
      <AppHeader title="نقاط السلوك" />
        <div className="p-8">
          <BackButton />
          {/* Header - يظهر فوراً */}
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            ⭐ نقاط السلوك اليومية
          </h1>
          <p className="text-gray-600 mb-6">تسجيل نقاط السلوك اليومية (4 معايير)</p>

          {/* Selectors - تظهر فوراً */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <CourseSelector 
              courses={courses}
              selectedCourseId={selectedCourseId}
              currentDate={selectedDate}
              pageType="behavior"
            />
            <DateSelector 
              selectedDate={selectedDate}
              courseId={selectedCourseId}
              pageType="behavior"
            />
          </div>

          {/* Students Data - يتحمل مع Suspense */}
          <Suspense fallback={<StudentsSkeleton />}>
            <StudentsDataAsync courseId={selectedCourseId} selectedDate={selectedDate} />
          </Suspense>

          {/* Footer Info - يظهر فوراً */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              💡 كل نقطة تُحسب في التقييم النهائي | 4 معايير: حضور مبكر، حفظ متقن، مشاركة فعالة، التزام بالوقت
            </p>
          </div>
        </div>
    </>
  );
}
