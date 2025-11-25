import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import AttendanceDataAsync from '@/components/my-attendance/AttendanceDataAsync';
import AttendanceSkeleton from '@/components/my-attendance/AttendanceSkeleton';

const statusConfig = {
  PRESENT: {
    label: 'حاضرة',
    symbol: 'ح',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  EXCUSED: {
    label: 'غائبة بعذر (معتذرة)',
    symbol: 'م',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  ABSENT: {
    label: 'غائبة بدون عذر',
    symbol: 'غ',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  REVIEWED: {
    label: 'راجعت بدون حضور',
    symbol: 'ر',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  LEFT_EARLY: {
    label: 'خروج مبكر',
    symbol: 'خ',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
};

export default async function MyAttendancePage() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  return (
    <>
      <AppHeader title="حضوري" />
        <main className="flex-1 overflow-auto p-6">
          <BackButton />
          {/* Header - يظهر فوراً */}
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            حضوري
          </h1>
          <p className="text-gray-600 mb-6">عرض سجل حضورك وإحصائياتك</p>

          {/* Attendance Data - مع Suspense */}
          <Suspense fallback={<AttendanceSkeleton />}>
            <AttendanceDataAsync userId={session.user.id} />
          </Suspense>

          {/* معلومات أساسية عن الحضور - تظهر فوراً */}
          <div className="mt-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-3">رموز الحضور:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-sm font-medium rounded border ${config.color}`}>
                    {config.symbol}
                  </span>
                  <span className="text-sm">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
    </>
  );
}
