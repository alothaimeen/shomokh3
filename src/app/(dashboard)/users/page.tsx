import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import UsersTable from '@/components/users/UsersTable';

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userName: true,
      userEmail: true,
      userRole: true,
      isActive: true,
      createdAt: true
    }
  });

  const usersData = users.map(user => ({
    id: user.id,
    userName: user.userName,
    userEmail: user.userEmail,
    userRole: user.userRole as string,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString()
  }));

  const stats = {
    admins: users.filter(u => u.userRole === 'ADMIN').length,
    teachers: users.filter(u => u.userRole === 'TEACHER').length,
    students: users.filter(u => u.userRole === 'STUDENT').length
  };

  return (
    <>
      <AppHeader title="إدارة المستخدمين" />
        <div className="p-8">
          <BackButton />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
              إدارة المستخدمين
            </h1>
            <p className="text-gray-600">عرض وإدارة جميع مستخدمي النظام</p>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
              <div className="text-sm text-red-700">مدراء</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.teachers}</div>
              <div className="text-sm text-green-700">معلمات</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.students}</div>
              <div className="text-sm text-purple-700">طالبات</div>
            </div>
          </div>

          {/* جدول المستخدمين */}
          <UsersTable users={usersData} currentUserId={session.user.id} />

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
