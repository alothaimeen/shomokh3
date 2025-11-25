import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import WeeklyGradesAsync from '@/components/grades/async/WeeklyGradesAsync';
import GradesSkeleton from '@/components/grades/async/GradesSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string; week?: string }>;
}

export default async function WeeklyGradesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = params.courseId || '';
  const week = parseInt(params.week || '1');

  return (
    <>
      <AppHeader title="الدرجات الأسبوعية" />
      <div className="p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          📊 الدرجات الأسبوعية
        </h1>
        <p className="text-gray-600 mb-6">إدخال درجات الأسبوع (0-5 لكل أسبوع)</p>

        <Suspense fallback={<GradesSkeleton />}>
          <WeeklyGradesAsync courseId={courseId} week={week} />
        </Suspense>
      </div>
    </>
  );
}
