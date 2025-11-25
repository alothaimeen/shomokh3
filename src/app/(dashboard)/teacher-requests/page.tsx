import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import RequestsDataAsync from '@/components/teacher-requests/RequestsDataAsync';
import RequestsSkeleton from '@/components/teacher-requests/RequestsSkeleton';

interface SearchParams {
  courseId?: string;
}

export default async function TeacherRequestsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const courseId = params.courseId;

  return (
    <>
      <AppHeader title="طلبات الانضمام" />
        <div className="p-8">
          <BackButton />
          {/* Header - يظهر فوراً */}
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            طلبات الانضمام للحلقات
          </h1>
          <p className="text-gray-600 mb-6">إدارة طلبات الطالبات للانضمام لحلقاتك</p>

          {/* Requests Data - مع Suspense */}
          <Suspense fallback={<RequestsSkeleton />}>
            <RequestsDataAsync userId={session.user.id} courseId={courseId} />
          </Suspense>
        </div>
    </>
  );
}
