import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import StatsCardsAsync from '@/components/students/StatsCardsAsync';
import StudentsTableAsync from '@/components/students/StudentsTableAsync';
import StatsCardsSkeleton from '@/components/students/StatsCardsSkeleton';
import StudentsTableSkeleton from '@/components/students/StudentsTableSkeleton';

interface SearchParams {
  search?: string;
  payment?: string;
}

export default async function StudentsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const searchTerm = params.search || '';
  const paymentFilter = params.payment || 'ALL';

  return (
    <>
      <AppHeader title="إدارة الطالبات" />
        <div className="p-8">
          <BackButton />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
              إدارة الطالبات
            </h1>
            <p className="text-gray-600">عرض وإدارة جميع الطالبات المسجلات</p>
          </div>

          {/* إحصائيات سريعة مع Suspense */}
          <Suspense fallback={<StatsCardsSkeleton />}>
            <StatsCardsAsync searchTerm={searchTerm} paymentFilter={paymentFilter} />
          </Suspense>

          {/* جدول الطالبات مع Suspense */}
          <Suspense fallback={<StudentsTableSkeleton />}>
            <StudentsTableAsync searchTerm={searchTerm} paymentFilter={paymentFilter} />
          </Suspense>

          {/* روابط العودة */}
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
    </>
  );
}
