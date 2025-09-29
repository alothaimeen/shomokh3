'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // لا تفعل شيء أثناء التحميل
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session) return;

      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // سيتم التوجيه للـ login
  }

  const currentUser = {
    userName: session.user?.name || "مستخدم",
    userEmail: session.user?.email || "",
    userRole: session.user?.role || "STUDENT"
  };

  // استخدام الإحصائيات الحقيقية أو القيم الافتراضية
  const currentStats = stats || {
    totalUsers: 0,
    totalPrograms: 0,
    totalCourses: 0,
    totalStudents: 0
  };

  // محتوى مختلف حسب الدور
  const getRoleContent = () => {
    switch (currentUser.userRole) {
      case 'ADMIN':
        return {
          title: 'لوحة تحكم المدير',
          actions: [
            { title: 'إدارة المستخدمين', color: 'bg-blue-600 hover:bg-blue-700', icon: '👥', link: '/users' },
            { title: 'إدارة البرامج', color: 'bg-green-600 hover:bg-green-700', icon: '📚', link: '/programs' },
            { title: 'بيانات الطالبات', color: 'bg-indigo-600 hover:bg-indigo-700', icon: '👩‍🎓', link: '/students' },
            { title: 'الطالبات المسجلات', color: 'bg-teal-600 hover:bg-teal-700', icon: '📝', link: '/enrolled-students' },
            { title: 'الحضور والغياب', color: 'bg-red-600 hover:bg-red-700', icon: '✅', link: '/attendance' },
            { title: 'تقرير الحضور', color: 'bg-orange-600 hover:bg-orange-700', icon: '📋', link: '/attendance-report' },
            { title: 'التقارير الشاملة', color: 'bg-purple-600 hover:bg-purple-700', icon: '📊', link: '/reports' },
          ],
          stats: ['totalUsers', 'totalPrograms', 'totalCourses', 'totalStudents']
        };
      case 'TEACHER':
        return {
          title: 'لوحة تحكم المعلمة',
          actions: [
            { title: 'اختيار الحلقة', color: 'bg-purple-600 hover:bg-purple-700', icon: '🎯', link: '/teacher' },
            { title: 'البرامج والحلقات', color: 'bg-green-600 hover:bg-green-700', icon: '📚', link: '/programs' },
          ],
          stats: ['totalCourses', 'totalStudents']
        };
      case 'STUDENT':
        return {
          title: 'لوحة تحكم الطالبة',
          actions: [
            { title: 'طلب الانضمام للحلقات', color: 'bg-blue-600 hover:bg-blue-700', icon: '📝', link: '/enrollment' },
            { title: 'البرامج المتاحة', color: 'bg-green-600 hover:bg-green-700', icon: '📚', link: '/programs' },
            { title: 'سجل حضوري', color: 'bg-red-600 hover:bg-red-700', icon: '✅', link: '/my-attendance' },
            { title: 'درجاتي', color: 'bg-purple-600 hover:bg-purple-700', icon: '🏆', link: '/my-grades' },
            { title: 'المهام اليومية', color: 'bg-orange-600 hover:bg-orange-700', icon: '📋', link: '/daily-tasks' },
          ],
          stats: []
        };
      default:
        return {
          title: 'لوحة التحكم',
          actions: [],
          stats: []
        };
    }
  };

  const roleContent = getRoleContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {roleContent.title}
            </h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-700">
                مرحباً، {currentUser.userName} ({currentUser.userRole})
              </span>
              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-800"
              >
                الملف الشخصي
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 hover:text-red-800"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards - حسب الدور */}
          {roleContent.stats.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${roleContent.stats.length > 2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-6 mb-8`}>
              {roleContent.stats.map((statKey) => {
                const statConfigMap = {
                  totalUsers: { label: 'إجمالي المستخدمين', icon: '👥', color: 'bg-blue-500' },
                  totalPrograms: { label: 'البرامج التعليمية', icon: '📚', color: 'bg-green-500' },
                  totalCourses: { label: 'الحلقات', icon: '🎓', color: 'bg-purple-500' },
                  totalStudents: { label: 'الطالبات', icon: '👩‍🎓', color: 'bg-orange-500' },
                };
                const statConfig = statConfigMap[statKey as keyof typeof statConfigMap];

                if (!statConfig) return null;

                return (
                  <div key={statKey} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 ${statConfig.color} rounded-md flex items-center justify-center`}>
                            <span className="text-white font-bold">{statConfig.icon}</span>
                          </div>
                        </div>
                        <div className="mr-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {statConfig.label}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {loadingStats ? '...' : currentStats[statKey as keyof typeof currentStats]}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions - حسب الدور */}
          {roleContent.actions.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  الإجراءات السريعة
                </h3>
                <div className={`grid grid-cols-1 ${roleContent.actions.length === 2 ? 'md:grid-cols-2' : roleContent.actions.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
                  {roleContent.actions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.link || '#'}
                      className={`${action.color} text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 hover:scale-105 transform`}
                    >
                      <span className="text-lg">{action.icon}</span>
                      <span>{action.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-500 mr-4">
            الصفحة الرئيسية
          </Link>
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            تسجيل الدخول
          </Link>
        </div>
      </main>
    </div>
  );
}