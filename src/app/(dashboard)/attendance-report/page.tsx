import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import AttendanceReportContent from '@/components/reports/AttendanceReportContent';

// Skeleton Component
function AttendanceReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4">
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-12 bg-gray-200"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 bg-gray-100 border-b border-gray-200"></div>
        ))}
      </div>
    </div>
  );
}

export default async function AttendanceReportPage() {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  return (
    <>
      <AppHeader title="تقرير الحضور" />
      <div className="p-4 md:p-8">
        <BackButton />

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            📋 تقرير الحضور والغياب
          </h1>
          <p className="text-gray-600">
            عرض تفصيلي لسجلات الحضور مع إمكانية التبديل بين العرض بحسب الطالبة أو التاريخ
          </p>
        </div>

        <Suspense fallback={<AttendanceReportSkeleton />}>
          <AttendanceReportContent
            userId={session.user.id}
            userRole={session.user.role}
          />
        </Suspense>
      </div>
    </>
  );
}
