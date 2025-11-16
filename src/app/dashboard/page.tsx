'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TeacherCourse {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  studentsCount: number;
}

interface StudentEnrollment {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  teacherName: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

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

  // جلب حلقات المعلمة
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!session || session.user?.role !== 'TEACHER') {
        setLoadingCourses(false);
        return;
      }

      try {
        const response = await fetch('/api/courses/teacher-courses');
        if (response.ok) {
          const data = await response.json();
          setTeacherCourses(data.courses || []);
        } else {
          console.error('فشل جلب الحلقات:', response.status);
        }
      } catch (error) {
        console.error('خطأ في جلب الحلقات:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchTeacherCourses();
  }, [session]);

  // جلب حلقات الطالبة المسجلة
  useEffect(() => {
    const fetchStudentEnrollments = async () => {
      if (!session || session.user?.role !== 'STUDENT') {
        setLoadingEnrollments(false);
        return;
      }

      try {
        const response = await fetch('/api/enrollment/my-enrollments');
        if (response.ok) {
          const data = await response.json();
          setStudentEnrollments(data.enrollments || []);
        }
      } catch (error) {
        console.error('خطأ في جلب التسجيلات:', error);
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchStudentEnrollments();
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
          actions: [],
          stats: []
        };
      case 'STUDENT':
        return {
          title: 'لوحة تحكم الطالبة',
          actions: [
            { title: 'طلب الانضمام للحلقات', color: 'bg-blue-600 hover:bg-blue-700', icon: '📝', link: '/enrollment' },
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
                href="/settings"
                className="text-indigo-600 hover:text-indigo-800"
              >
                ⚙️ الإعدادات
              </Link>
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

          {/* Teacher Courses Section */}
          {currentUser.userRole === 'TEACHER' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  حلقاتي
                </h3>
                {loadingCourses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">جاري تحميل الحلقات...</p>
                  </div>
                ) : teacherCourses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">لا توجد حلقات مسندة لك حالياً</p>
                ) : (
                  <div className="space-y-4">
                    {teacherCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{course.courseName}</h4>
                          <p className="text-sm text-gray-600">
                            {course.programName} - المستوى {course.level} - {course.studentsCount} طالبة
                          </p>
                        </div>
                        
                        {/* أزرار الإدارة */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                          <Link
                            href={`/attendance?courseId=${course.id}`}
                            className="bg-red-600 hover:bg-data-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                          >
                            ✅ الحضور
                          </Link>
                          <Link
                            href={`/teacher-requests?courseId=${course.id}`}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                          >
                            📋 الطلبات
                          </Link>
                          <Link
                            href={`/enrolled-students?courseId=${course.id}`}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                          >
                            👩‍🎓 الطالبات
                          </Link>
                          <Link
                            href={`/academic-reports?courseId=${course.id}`}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                          >
                            📊 التقرير
                          </Link>
                        </div>

                        {/* الصفحة الموحدة - موصى بها */}
                        <div className="border-t pt-3 mt-3 mb-3">
                          <Link
                            href={`/unified-assessment?courseId=${course.id}`}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg text-center font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">⭐</span>
                            <span>الصفحة الموحدة للتقييم (موصى بها)</span>
                          </Link>
                        </div>

                        {/* أزرار الدرجات متجاورة - الواجهات المنفصلة */}
                        <div className="border-t pt-3 mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">التقييمات والدرجات (الواجهات المنفصلة):</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <Link
                              href={`/daily-grades?courseId=${course.id}`}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              📝 يومي
                            </Link>
                            <Link
                              href={`/weekly-grades?courseId=${course.id}`}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              📅 أسبوعي
                            </Link>
                            <Link
                              href={`/monthly-grades?courseId=${course.id}`}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              🗓️ شهري
                            </Link>
                            <Link
                              href={`/behavior-grades?courseId=${course.id}`}
                              className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              ⭐ السلوك
                            </Link>
                            <Link
                              href={`/behavior-points?courseId=${course.id}`}
                              className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              🌟 النقاط السلوكية
                            </Link>
                            <Link
                              href={`/final-exam?courseId=${course.id}`}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              📄 النهائي
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Enrollments Section */}
          {currentUser.userRole === 'STUDENT' && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  حلقاتي المسجلة
                </h3>
                {loadingEnrollments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">جاري تحميل الحلقات...</p>
                  </div>
                ) : studentEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">لم تسجلي في أي حلقة بعد</p>
                    <Link
                      href="/enrollment"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
                    >
                      📝 طلب الانضمام للحلقات
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{enrollment.courseName}</h4>
                          <p className="text-sm text-gray-600">
                            {enrollment.programName} - المستوى {enrollment.level} - المعلمة: {enrollment.teacherName}
                          </p>
                        </div>
                        
                        {/* الصفحة الموحدة - موصى بها */}
                        <div className="mb-3">
                          <Link
                            href={`/unified-assessment?courseId=${enrollment.id}`}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg text-center font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">⭐</span>
                            <span>الصفحة الموحدة (موصى بها)</span>
                          </Link>
                        </div>

                        {/* أزرار الوصول السريع - الواجهات المنفصلة */}
                        <div className="border-t pt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">الواجهات المنفصلة:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <Link
                              href={`/my-attendance?courseId=${enrollment.id}`}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              ✅ حضوري
                            </Link>
                            <Link
                              href={`/my-grades?courseId=${enrollment.id}`}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              🏆 درجاتي
                            </Link>
                            <Link
                              href={`/daily-tasks?courseId=${enrollment.id}`}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                            >
                              📋 مهامي
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions - للأدوار الأخرى */}
          {currentUser.userRole !== 'TEACHER' && currentUser.userRole !== 'STUDENT' && roleContent.actions.length > 0 && (
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