import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import StatsAsync from '@/components/users/StatsAsync';
import StatsSkeleton from '@/components/users/StatsSkeleton';
import UsersTableAsync from '@/components/users/UsersTableAsync';
import UsersTableSkeleton from '@/components/users/UsersTableSkeleton';

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <>
      <AppHeader title="إدارة المستخدمين" />
        <div className="p-8">
          <BackButton />
          
          {/* Header - يظهر فوراً */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
              إدارة المستخدمين
            </h1>
            <p className="text-gray-600">عرض وإدارة جميع مستخدمي النظام</p>
          </div>

          {/* إحصائيات سريعة - مع Suspense */}
          <Suspense fallback={<StatsSkeleton />}>
            <StatsAsync />
          </Suspense>

          {/* جدول المستخدمين - مع Suspense */}
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersTableAsync currentUserId={session.user.id} />
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
