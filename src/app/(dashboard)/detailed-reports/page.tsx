import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import DetailedReportsAsync from '@/components/reports/DetailedReportsAsync';
import { DetailedReportsSkeleton } from '@/components/reports/DetailedReportsSkeleton';

export default async function DetailedReportsPage() {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  return (
    <>
      <AppHeader title="التقارير التفصيلية" />
      <div className="p-8">
        <BackButton />
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            التقارير التفصيلية
          </h1>
          <p className="text-gray-600">
            تقارير شاملة للحضور والدرجات والنقاط التحفيزية مع إمكانية التصدير
          </p>
        </div>

        <Suspense fallback={<DetailedReportsSkeleton />}>
          <DetailedReportsAsync 
            userId={session.user.id} 
            userRole={session.user.role} 
          />
        </Suspense>
      </div>
    </>
  );
}
