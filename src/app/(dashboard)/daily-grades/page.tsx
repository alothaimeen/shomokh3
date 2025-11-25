import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import DailyGradesAsync from '@/components/grades/async/DailyGradesAsync';
import GradesSkeleton from '@/components/grades/async/GradesSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string; date?: string }>;
}

export default async function DailyGradesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = params.courseId || '';
  const date = params.date || new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Header - يظهر فوراً */}
      <AppHeader title="الدرجات اليومية" />
      
      <div className="p-8">
        {/* Back Button - يظهر فوراً */}
        <BackButton />
        
        {/* Title - يظهر فوراً */}
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          📊 التقييم اليومي
        </h1>
        <p className="text-gray-600 mb-6">
          إدخال درجات التقييم اليومي للطالبات (حفظ وتجويد + مراجعة وتجويد)
        </p>

        {/* Suspense: Skeleton يظهر فوراً، البيانات تتحمل في الخلفية */}
        <Suspense fallback={<GradesSkeleton />}>
          <DailyGradesAsync courseId={courseId} date={date} />
        </Suspense>
      </div>
    </>
  );
}
