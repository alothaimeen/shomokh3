import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import AttendanceAsync from '@/components/attendance/async/AttendanceAsync';
import AttendanceSkeleton from '@/components/attendance/async/AttendanceSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string; date?: string }>;
}

export default async function AttendancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = params.courseId || '';
  const date = params.date || new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Header - يظهر فوراً */}
      <AppHeader title="تسجيل الحضور" />
      
      <div className="p-8">
        {/* Back Button - يظهر فوراً */}
        <BackButton />
        
        {/* Title - يظهر فوراً */}
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          تسجيل الحضور والغياب
        </h1>

        {/* Suspense: Skeleton يظهر فوراً، البيانات تتحمل في الخلفية */}
        <Suspense fallback={<AttendanceSkeleton />}>
          <AttendanceAsync courseId={courseId} date={date} />
        </Suspense>
      </div>
    </>
  );
}
