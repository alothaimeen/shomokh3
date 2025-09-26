'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  courseName: string;
  courseDescription?: string;
  syllabus?: string;
  level: number;
  maxStudents: number;
  currentStudents: number;
  isAvailable: boolean;
  program: {
    id: string;
    programName: string;
    programDescription?: string;
  };
  teacher: {
    id: string;
    userName: string;
  } | null;
}

interface EnrollmentRequestData {
  courseId: string;
  message: string;
}

export default function EnrollmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.userRole !== 'STUDENT') {
      router.push('/dashboard');
      return;
    }

    fetchAvailableCourses();
  }, [session, status, router]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch('/api/enrollment/available-courses');
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في جلب البيانات'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      setNotification({
        type: 'error',
        message: 'يرجى اختيار حلقة للانضمام إليها'
      });
      return;
    }

    setSubmitting(true);

    try {
      const requestData: EnrollmentRequestData = {
        courseId: selectedCourse,
        message: message.trim() || ''
      };

      const response = await fetch('/api/enrollment/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: data.message
        });
        setSelectedCourse('');
        setMessage('');
        // إعادة جلب البيانات لتحديث الحالة
        fetchAvailableCourses();
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في تقديم الطلب'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">طلب الانضمام للحلقات</h1>
          <p className="text-gray-600">اختاري الحلقة المناسبة لك وقدمي طلب الانضمام</p>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {notification.message}
          </div>
        )}

        {/* قائمة الحلقات المتاحة */}
        <div className="grid gap-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800">الحلقات المتاحة (المستوى الأول)</h2>

          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              لا توجد حلقات متاحة حالياً
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{course.courseName}</h3>
                    <p className="text-sm text-blue-600 font-medium">{course.program.programName}</p>
                  </div>

                  {course.courseDescription && (
                    <p className="text-gray-600 text-sm mb-3">{course.courseDescription}</p>
                  )}

                  {course.syllabus && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">النصاب:</p>
                      <p className="text-sm text-gray-600">{course.syllabus}</p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {course.teacher && (
                      <p><span className="font-medium">المعلمة:</span> {course.teacher.userName}</p>
                    )}
                    <p><span className="font-medium">المستوى:</span> {course.level}</p>
                    <p><span className="font-medium">العدد:</span> {course.currentStudents}/{course.maxStudents}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {course.isAvailable ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600 font-medium">✓ متاحة</span>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="selectedCourse"
                            value={course.id}
                            checked={selectedCourse === course.id}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm">اختيار</span>
                        </label>
                      </div>
                    ) : (
                      <span className="text-sm text-red-600 font-medium">✗ مكتملة العدد</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* نموذج طلب الانضمام */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">تقديم طلب الانضمام</h2>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحلقة المختارة
              </label>
              {selectedCourse ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
                  {courses.find(c => c.id === selectedCourse)?.courseName} - {' '}
                  {courses.find(c => c.id === selectedCourse)?.program.programName}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-500">
                  يرجى اختيار حلقة من القائمة أعلاه
                </div>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                رسالة إضافية (اختيارية)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتبي أي ملاحظات أو أسئلة للمعلمة..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!selectedCourse || submitting}
                className={`px-6 py-2 rounded font-medium ${
                  !selectedCourse || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors`}
              >
                {submitting ? 'جاري التقديم...' : 'تقديم طلب الانضمام'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}