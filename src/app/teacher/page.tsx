'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      const fetchedCourses = data.courses || [];
      setCourses(fetchedCourses);
      
      // اختيار أول حلقة تلقائياً
      if (fetchedCourses.length > 0) {
        setSelectedCourse(fetchedCourses[0]);
      }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // عرض الخيارات (الحلقة مختارة تلقائياً)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:mr-72">
        {/* Header */}
        <AppHeader
          title={selectedCourse ? selectedCourse.courseName : 'حلقاتي'}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <BackButton />

            {/* معلومات الحلقة */}
            {selectedCourse && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCourse.courseName}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedCourse.program.programName} - المستوى {selectedCourse.level}
                    </p>
                  </div>
                  
                  {/* زر تغيير الحلقة */}
                  {courses.length > 1 && (
                    <select
                      value={selectedCourse.id}
                      onChange={(e) => {
                        const course = courses.find(c => c.id === e.target.value);
                        if (course) setSelectedCourse(course);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 p-4 rounded-lg text-center border border-primary-blue/20">
                    <div className="text-3xl font-bold text-primary-blue">{selectedCourse._count.enrollments}</div>
                    <div className="text-gray-600 mt-1">الطالبات المسجلات</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 p-4 rounded-lg text-center border border-primary-purple/20">
                    <div className="text-3xl font-bold text-primary-purple">المستوى {selectedCourse.level}</div>
                    <div className="text-gray-600 mt-1">مستوى الحلقة</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-dark/10 to-secondary-dark/5 p-4 rounded-lg text-center border border-secondary-dark/20">
                    <div className="text-lg font-bold text-secondary-dark">{selectedCourse.program.programName}</div>
                    <div className="text-gray-600 mt-1">البرنامج التعليمي</div>
                  </div>
                </div>
              </div>
            )}

            {/* الإجراءات السريعة */}
            {selectedCourse && (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  إدارة الحلقة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    href={`/attendance?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">✅</span>
                    <span className="font-semibold">الحضور والغياب</span>
                  </Link>

                  <Link
                    href={`/daily-grades?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-primary-purple to-primary-purple/80 hover:from-primary-purple/90 hover:to-primary-purple text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">📊</span>
                    <span className="font-semibold">التقييم اليومي</span>
                  </Link>

                  <Link
                    href={`/weekly-grades?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-primary-blue to-primary-blue/80 hover:from-primary-blue/90 hover:to-primary-blue text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">📅</span>
                    <span className="font-semibold">التقييم الأسبوعي</span>
                  </Link>

                  <Link
                    href={`/monthly-grades?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">📆</span>
                    <span className="font-semibold">التقييم الشهري</span>
                  </Link>

                  <Link
                    href={`/behavior-grades?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold">درجات السلوك</span>
                  </Link>

                  <Link
                    href={`/final-exam?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">🎓</span>
                    <span className="font-semibold">الاختبار النهائي</span>
                  </Link>

                  <Link
                    href={`/teacher-requests?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-secondary-dark to-secondary-dark/80 hover:from-secondary-dark/90 hover:to-secondary-dark text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">📋</span>
                    <span className="font-semibold">طلبات الانضمام</span>
                  </Link>

                  <Link
                    href={`/enrolled-students?courseId=${selectedCourse.id}`}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-2xl">📝</span>
                    <span className="font-semibold">الطالبات المسجلات</span>
                  </Link>
                </div>
              </div>
            )}

            {/* رسالة في حالة عدم وجود حلقات */}
            {!selectedCourse && courses.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  لا توجد حلقات مخصصة لك حالياً
                </h3>
                <p className="text-gray-500">
                  يرجى التواصل مع الإدارة لتخصيص حلقات لك
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}