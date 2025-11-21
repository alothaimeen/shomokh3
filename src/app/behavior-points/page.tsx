'use client';

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import { useTeacherCourses } from '@/hooks/useCourses';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface Enrollment {
  id: string;
  student: {
    id: string;
    studentName: string;
  };
}

interface BehaviorPoint {
  date: string;
  earlyAttendance: boolean;
  perfectMemorization: boolean;
  activeParticipation: boolean;
  timeCommitment: boolean;
  notes?: string;
}

interface StudentPoints extends BehaviorPoint {
  studentId: string;
  studentName: string;
}

function BehaviorPointsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentPoints[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ استخدام SWR hooks
  const { data: coursesData, isLoading: loadingCourses } = useSWR<{ courses: any[] }>(
    session?.user ? '/api/courses/teacher-courses' : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );
  const { data: pointsData, isLoading: loadingPoints, mutate: refreshPoints } = useSWR<{ students: StudentPoints[] }>(
    selectedCourseId && selectedDate ? `/api/points/behavior?courseId=${selectedCourseId}&date=${selectedDate}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const courses = coursesData?.courses || [];
  const loading = loadingCourses || loadingPoints;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const courseId = searchParams.get('courseId');
    if (courseId && courses.some((c: any) => c.id === courseId)) {
      setSelectedCourseId(courseId);
    } else if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, searchParams, selectedCourseId]);

  useEffect(() => {
    if (pointsData?.students) {
      setStudents(pointsData.students);
    }
  }, [pointsData]);

  const handleCheckboxChange = (studentId: string, field: keyof BehaviorPoint) => {
    setStudents(prev => prev.map(student => 
      student.studentId === studentId
        ? { ...student, [field]: !student[field as keyof StudentPoints] }
        : student
    ));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setStudents(prev => prev.map(student => 
      student.studentId === studentId
        ? { ...student, notes }
        : student
    ));
  };

  const calculatePoints = (student: StudentPoints) => {
    let points = 0;
    if (student.earlyAttendance) points += 5;
    if (student.perfectMemorization) points += 5;
    if (student.activeParticipation) points += 5;
    if (student.timeCommitment) points += 5;
    return points;
  };

  const handleSaveAll = async () => {
    if (!selectedCourseId) {
      setMessage('الرجاء اختيار حلقة');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/points/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          date: selectedDate,
          points: students.map(s => ({
            studentId: s.studentId,
            earlyAttendance: s.earlyAttendance,
            perfectMemorization: s.perfectMemorization,
            activeParticipation: s.activeParticipation,
            timeCommitment: s.timeCommitment,
            notes: s.notes
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ تم حفظ النقاط لـ ${students.length} طالبة`);
        refreshPoints(); // ✅ تحديث SWR cache
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ خطأ في حفظ النقاط');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:mr-72 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          هذه الصفحة مخصصة للمعلمات فقط
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          لا توجد حلقات مسندة لك
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="النقاط السلوكية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">النقاط السلوكية</h1>

      {/* اختيار الحلقة والتاريخ */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحلقة
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.programName} - {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* شرح النقاط */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
        <h3 className="font-bold text-blue-800 mb-2">معايير النقاط السلوكية (20 نقطة يومياً):</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• الحضور المبكر (5 نقاط)</li>
          <li>• الحفظ المتقن (5 نقاط)</li>
          <li>• المشاركة الفعالة (5 نقاط)</li>
          <li>• الالتزام بالحضور حتى نهاية الوقت (5 نقاط)</li>
          <li className="font-bold mt-2">المجموع الكلي: 20 نقطة × 70 يوم = 1400 نقطة</li>
        </ul>
      </div>

      {/* جدول الطالبات */}
      {students.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider sticky right-0 bg-gray-50">
                  الطالبة
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  حضور مبكر<br />(5)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  حفظ متقن<br />(5)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  مشاركة<br />(5)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  التزام بالوقت<br />(5)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  المجموع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  ملاحظات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky right-0 bg-white">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={student.earlyAttendance}
                      onChange={() => handleCheckboxChange(student.studentId, 'earlyAttendance')}
                      className="h-5 w-5"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={student.perfectMemorization}
                      onChange={() => handleCheckboxChange(student.studentId, 'perfectMemorization')}
                      className="h-5 w-5"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={student.activeParticipation}
                      onChange={() => handleCheckboxChange(student.studentId, 'activeParticipation')}
                      className="h-5 w-5"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={student.timeCommitment}
                      onChange={() => handleCheckboxChange(student.studentId, 'timeCommitment')}
                      className="h-5 w-5"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                    {calculatePoints(student)} / 20
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={student.notes || ''}
                      onChange={(e) => handleNotesChange(student.studentId, e.target.value)}
                      placeholder="ملاحظات..."
                      className="w-full p-1 border rounded text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* زر الحفظ */}
          <div className="p-6">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'جاري الحفظ...' : `حفظ النقاط لجميع الطالبات (${students.length})`}
            </button>

            {message && (
              <div className={`mt-4 p-4 rounded ${
                message.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          لا توجد طالبات مسجلات في هذه الحلقة
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default function BehaviorPointsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-xl">جاري التحميل...</div></div>}>
      <BehaviorPointsContent />
    </Suspense>
  );
}
