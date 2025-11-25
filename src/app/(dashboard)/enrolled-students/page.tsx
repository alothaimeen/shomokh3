import { Suspense } from 'react';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import EnrolledStudentsAsync from '@/components/enrolled-students/EnrolledStudentsAsync';
import EnrolledStudentsSkeleton from '@/components/enrolled-students/EnrolledStudentsSkeleton';

interface PageProps {
  searchParams: Promise<{ courseId?: string }>;
}

export default async function EnrolledStudentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const courseId = params.courseId || '';

  return (
    <>
      <AppHeader title="الطالبات المسجلات" />
      <div className="p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          📝 الطالبات المسجلات
        </h1>

        <Suspense fallback={<EnrolledStudentsSkeleton />}>
          <EnrolledStudentsAsync courseId={courseId} />
        </Suspense>
      </div>
    </>
  );
}
