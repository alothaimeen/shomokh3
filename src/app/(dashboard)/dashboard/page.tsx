import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppHeader from '@/components/shared/AppHeader';
import HijriDateDisplay from '@/components/shared/HijriDateDisplay';
import AdminStatsAsync from '@/components/dashboard/AdminStatsAsync';
import TeacherCoursesAsync from '@/components/dashboard/TeacherCoursesAsync';
import StudentEnrollmentsAsync from '@/components/dashboard/StudentEnrollmentsAsync';
import AdminDashboardSkeleton from '@/components/dashboard/AdminDashboardSkeleton';
import TeacherDashboardSkeleton from '@/components/dashboard/TeacherDashboardSkeleton';
import StudentDashboardSkeleton from '@/components/dashboard/StudentDashboardSkeleton';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;

  return (
    <>
      <AppHeader title="لوحة التحكم" />
      <div className="p-8">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
              مرحباً، {session.user.name}
            </h1>
            <p className="text-gray-600 text-lg">
              {role === 'ADMIN' && 'مديرة المنصة'}
              {role === 'TEACHER' && 'معلمة'}
              {role === 'STUDENT' && 'طالبة'}
            </p>
          </div>
          <HijriDateDisplay />
        </div>

        {/* Admin Dashboard */}
        {role === 'ADMIN' && (
          <Suspense fallback={<AdminDashboardSkeleton />}>
            <AdminStatsAsync />
          </Suspense>
        )}

        {/* Teacher Dashboard */}
        {role === 'TEACHER' && (
          <Suspense fallback={<TeacherDashboardSkeleton />}>
            <TeacherCoursesAsync teacherId={session.user.id} />
          </Suspense>
        )}

        {/* Student Dashboard */}
        {role === 'STUDENT' && (
          <Suspense fallback={<StudentDashboardSkeleton />}>
            <StudentEnrollmentsAsync userId={session.user.id} />
          </Suspense>
        )}
      </div>
    </>
  );
}
