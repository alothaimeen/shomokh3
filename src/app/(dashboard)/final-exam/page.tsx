import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import FinalExamAsync from '@/components/final-exam/FinalExamAsync';
import FinalExamSkeleton from '@/components/final-exam/FinalExamSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string }>;
}

export default async function FinalExamPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = params.courseId || '';

  return (
    <>
      <AppHeader title="الاختبار النهائي" />
      <div className="p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
          🎓 الاختبار النهائي
        </h1>

        <Suspense fallback={<FinalExamSkeleton />}>
          <FinalExamAsync courseId={courseId} />
        </Suspense>
      </div>
    </>
  );
}
