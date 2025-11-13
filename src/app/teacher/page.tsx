'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: string;
  courseName: string;
  level: number;
  program: {
    id: string;
    programName: string;
  };
  teacher?: {
    id: string;
    userName: string;
  };
  _count: {
    enrollments: number;
  };
}

export default function TeacherCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.userRole !== 'TEACHER') {
      router.push('/dashboard');
      return;
    }

    fetchCourses();
  }, [session, status, router]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/attendance/teacher-courses');

      if (!response.ok) {
        console.error('خطأ في API:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('خطأ في جلب الحلقات:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                اختيار الحلقة
              </h1>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-sm text-gray-700">
                  مرحباً، {session?.user?.name} (معلمة)
                </span>
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-800"
                >
                  العودة للوحة التحكم
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                اختاري الحلقة للعمل عليها
              </h2>

              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg">
                    لا توجد حلقات مخصصة لك حالياً
                  </div>
                  <p className="text-gray-400 mt-2">
                    يرجى التواصل مع الإدارة لتخصيص حلقات لك
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer text-right w-full"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {course.level}
                          </span>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">
                          {course._count.enrollments} طالبة
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {course.courseName}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4">
                        {course.program.programName}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          المستوى {course.level}
                        </span>
                        <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          اختيار الحلقة ←
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // عند اختيار الحلقة - عرض الخيارات
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedCourse.courseName}
              </h1>
              <p className="text-gray-600">
                {selectedCourse.program.programName} - المستوى {selectedCourse.level}
              </p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                تغيير الحلقة
              </button>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                العودة للوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* إحصائيات سريعة */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ملخص الحلقة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedCourse._count.enrollments}</div>
                <div className="text-gray-600">الطالبات المسجلات</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">المستوى {selectedCourse.level}</div>
                <div className="text-gray-600">مستوى الحلقة</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-600">{selectedCourse.program.programName}</div>
                <div className="text-gray-600">البرنامج التعليمي</div>
              </div>
            </div>
          </div>

          {/* الإجراءات السريعة */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                إدارة الحلقة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href={`/attendance?courseId=${selectedCourse.id}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 hover:scale-105 transform"
                >
                  <span className="text-lg">✅</span>
                  <span>الحضور والغياب</span>
                </Link>

                <Link
                  href={`/daily-grades?courseId=${selectedCourse.id}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 hover:scale-105 transform"
                >
                  <span className="text-lg">📊</span>
                  <span>التقييم اليومي</span>
                </Link>

                <Link
                  href={`/teacher-requests?courseId=${selectedCourse.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 hover:scale-105 transform"
                >
                  <span className="text-lg">📋</span>
                  <span>طلبات الانضمام</span>
                </Link>

                <Link
                  href={`/enrolled-students?courseId=${selectedCourse.id}`}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2 hover:scale-105 transform"
                >
                  <span className="text-lg">📝</span>
                  <span>الطالبات المسجلات</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}