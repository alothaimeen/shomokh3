import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import MonthlyGradesAsync from '@/components/grades/async/MonthlyGradesAsync';
import GradesSkeleton from '@/components/grades/async/GradesSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string; month?: string }>;
}

export default async function MonthlyGradesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = params.courseId || '';
  const month = parseInt(params.month || '1');

  return (
    <>
      <AppHeader title="الدرجات الشهرية" />
      <div className="p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          📊 الدرجات الشهرية
        </h1>
        <p className="text-gray-600 mb-6">إدخال درجات الشهر (نسيان + لحن جلي + لحن خفي + تجويد نظري)</p>

        <Suspense fallback={<GradesSkeleton />}>
          <MonthlyGradesAsync courseId={courseId} month={month} />
        </Suspense>
      </div>
    </>
  );
}
