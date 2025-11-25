import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import TeacherCoursesAsync from '@/components/teacher/TeacherCoursesAsync';
import TeacherCoursesSkeleton from '@/components/teacher/TeacherCoursesSkeleton';

export default function TeacherCoursePage() {
  return (
    <>
      {/* Header - يظهر فوراً */}
      <AppHeader title="حلقاتي" />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Back Button - يظهر فوراً */}
        <BackButton />

        {/* Suspense: Skeleton يظهر فوراً، البيانات تتحمل في الخلفية */}
        <Suspense fallback={<TeacherCoursesSkeleton />}>
          <TeacherCoursesAsync />
        </Suspense>
      </main>
    </>
  );
}