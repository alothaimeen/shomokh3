import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import BehaviorGradesAsync from '@/components/grades/async/BehaviorGradesAsync';
import GradesSkeleton from '@/components/grades/async/GradesSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string; date?: string }>;
}

export default async function BehaviorGradesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = params.courseId || '';
  const date = params.date || new Date().toISOString().split('T')[0];

  return (
    <>
      <AppHeader title="درجات السلوك اليومية" />
      <div className="p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          ⭐ درجات السلوك اليومية
        </h1>

        <Suspense fallback={<GradesSkeleton />}>
          <BehaviorGradesAsync courseId={courseId} date={date} />
        </Suspense>
      </div>
    </>
  );
}
