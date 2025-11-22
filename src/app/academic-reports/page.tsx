'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

interface StudentGrades {
  dailyRaw: number;
  weeklyRaw: number;
  monthlyRaw: number;
  behaviorRaw: number;
  finalExamRaw: number;
  daily: number;
  weekly: number;
  monthly: number;
  behavior: number;
  finalExam: number;
  total: number;
  percentage: number;
}

interface StudentReport {
  studentId: number;
  studentName: string;
  grades: StudentGrades;
}

interface Course {
  id: string;
  courseName: string;
  program: {
    programName: string;
  };
}

export default function AcademicReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      router.push('/dashboard');
      return;
    }

    fetchCourses();
    
    // Check if courseId is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseIdFromUrl = urlParams.get('courseId');
    if (courseIdFromUrl) {
      setSelectedCourse(courseIdFromUrl);
      // Auto-fetch reports after courses are loaded
      setTimeout(() => fetchReportsForCourse(courseIdFromUrl), 500);
    }
    
    setLoading(false);
  }, [session, status, router]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses/teacher-courses');
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchReportsForCourse = async (courseId: string) => {
    if (!courseId) {
      setMessage('الرجاء اختيار حلقة');
      return;
    }

    setLoadingReports(true);
    setMessage('');

    try {
      const res = await fetch(`/api/grades/academic-report?courseId=${courseId}`);
      const data = await res.json();

      if (res.ok) {
        setReports(data.reports || []);
        if (data.reports.length === 0) {
          setMessage('لا توجد طالبات مسجلات في هذه الحلقة. يرجى التأكد من وجود طالبات مسجلات أولاً.');
        }
      } else {
        setMessage(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setMessage('حدث خطأ أثناء جلب التقارير');
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchReports = () => {
    fetchReportsForCourse(selectedCourse);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="التقارير الأكاديمية" />
        <div className="p-8">
          <BackButton />
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">التقرير الشامل للدرجات</h1>
            <p className="text-gray-600">عرض تفصيلي لجميع درجات الطالبات والحساب النهائي</p>
          </div>

          {/* Course Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر الحلقة
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- اختر حلقة --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseName} - {course.program?.programName}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchReports}
              disabled={loadingReports || !selectedCourse}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loadingReports ? 'جاري التحميل...' : 'عرض التقرير'}
            </button>
          </div>
          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
              {message}
            </div>
          )}
          </div>

          {/* Reports Table */}
          {reports.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                      م
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-12 bg-gray-50">
                      اسم الطالبة
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      يومي (700→50)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      أسبوعي (50)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      شهري (90→30)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      سلوك (70→10)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      نهائي (60)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                      المجموع (200)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                      النسبة %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report, index) => (
                    <tr key={report.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 sticky right-0 bg-white">
                        {report.studentId}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky right-12 bg-white">
                        {report.studentName}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-xs">{report.grades.dailyRaw}</span>
                          <span className="font-semibold text-blue-600">{report.grades.daily}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-600">{report.grades.weekly}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-xs">{report.grades.monthlyRaw}</span>
                          <span className="font-semibold text-blue-600">{report.grades.monthly}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-xs">{report.grades.behaviorRaw}</span>
                          <span className="font-semibold text-blue-600">{report.grades.behavior}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-600">{report.grades.finalExam}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-bold text-blue-700 bg-blue-50">
                        {report.grades.total}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-bold text-green-700 bg-blue-50">
                        {report.grades.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {/* Legend */}
          {reports.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">شرح الصيغ:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold text-gray-800">يومي:</span> 700 ÷ 14 = 50 درجة
              </div>
              <div>
                <span className="font-semibold text-gray-800">أسبوعي:</span> 10 أسابيع × 5 = 50 درجة
              </div>
              <div>
                <span className="font-semibold text-gray-800">شهري:</span> 90 ÷ 3 = 30 درجة
              </div>
              <div>
                <span className="font-semibold text-gray-800">سلوك:</span> 70 ÷ 7 = 10 درجات
              </div>
              <div>
                <span className="font-semibold text-gray-800">نهائي:</span> قرآن (40) + تجويد (20) = 60 درجة
              </div>
              <div>
                <span className="font-semibold text-gray-800">المجموع:</span> 50 + 50 + 30 + 10 + 60 = 200 درجة
              </div>
            </div>
            </div>
          )}

          {/* العودة للوحة التحكم */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}