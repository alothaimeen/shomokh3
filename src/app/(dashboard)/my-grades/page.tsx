import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import GradesDataAsync from '@/components/my-grades/GradesDataAsync';
import GradesSkeleton from '@/components/my-grades/GradesSkeleton';

export default async function MyGradesPage() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  return (
    <>
      <AppHeader title="درجاتي" />
        <main className="flex-1 overflow-auto p-6">
          <BackButton />
          {/* Header - يظهر فوراً */}
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            درجاتي
          </h1>
          <p className="text-gray-600 mb-6">عرض تفصيلي لجميع درجاتك ونقاطك التحفيزية</p>

          {/* Grades Data - مع Suspense */}
          <Suspense fallback={<GradesSkeleton />}>
            <GradesDataAsync userId={session.user.id} />
          </Suspense>
        </main>
    </>
  );
}
