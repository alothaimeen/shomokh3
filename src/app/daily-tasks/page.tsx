'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from '@/components/shared/Sidebar';
import BackButton from '@/components/shared/BackButton';

interface Enrollment {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  teacherName: string;
}

interface DailyTask {
  date: string;
  listening5Times: boolean;
  repetition10Times: boolean;
  recitedToPeer: boolean;
  notes?: string;
}

function DailyTasksContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [taskData, setTaskData] = useState<DailyTask>({
    date: new Date().toISOString().split('T')[0],
    listening5Times: false,
    repetition10Times: false,
    recitedToPeer: false,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await fetch('/api/enrollment/my-enrollments');
        const data = await response.json();
        
        if (data.enrollments) {
          setEnrollments(data.enrollments);
          
          const courseId = searchParams.get('courseId');
          if (courseId && data.enrollments.some((e: Enrollment) => e.id === courseId)) {
            setSelectedCourseId(courseId);
          } else if (data.enrollments.length > 0) {
            setSelectedCourseId(data.enrollments[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchEnrollments();
    }
  }, [status, searchParams]);

  useEffect(() => {
    const fetchTask = async () => {
      if (!selectedCourseId || !taskData.date) return;

      try {
        const response = await fetch(`/api/points/daily-tasks?courseId=${selectedCourseId}&date=${taskData.date}`);
        const data = await response.json();
        
        if (data.task) {
          setTaskData({
            date: taskData.date,
            listening5Times: data.task.listening5Times || false,
            repetition10Times: data.task.repetition10Times || false,
            recitedToPeer: data.task.recitedToPeer || false,
            notes: data.task.notes || ''
          });
        } else {
          // إعادة تعيين للقيم الافتراضية إذا لم توجد بيانات
          setTaskData({
            date: taskData.date,
            listening5Times: false,
            repetition10Times: false,
            recitedToPeer: false,
            notes: ''
          });
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      }
    };

    fetchTask();
  }, [selectedCourseId, taskData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/points/daily-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          date: taskData.date,
          listening5Times: taskData.listening5Times,
          repetition10Times: taskData.repetition10Times,
          recitedToPeer: taskData.recitedToPeer,
          notes: taskData.notes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل حفظ المهام');
      }

      setMessage('✅ تم حفظ المهام بنجاح!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ حدث خطأ أثناء الحفظ');
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculatePoints = () => {
    return (taskData.listening5Times ? 5 : 0) + 
           (taskData.repetition10Times ? 5 : 0) + 
           (taskData.recitedToPeer ? 5 : 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (enrollments.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">لم تسجلي في أي حلقة بعد</p>
          <button
            onClick={() => router.push('/enrollment')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            📝 طلب الانضمام للحلقات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="مهامي اليومية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">📋 مهامي اليومية</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {enrollments.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختاري الحلقة</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {enrollments.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.id}>
                  {enrollment.courseName} - {enrollment.programName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
          <input
            type="date"
            value={taskData.date}
            onChange={(e) => setTaskData({...taskData, date: e.target.value})}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="listening5Times"
            checked={taskData.listening5Times}
            onChange={(e) => setTaskData({...taskData, listening5Times: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="listening5Times" className="mr-2 text-sm font-medium text-gray-700">
            🎧 السماع 5 مرات (5 نقاط)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="repetition10Times"
            checked={taskData.repetition10Times}
            onChange={(e) => setTaskData({...taskData, repetition10Times: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="repetition10Times" className="mr-2 text-sm font-medium text-gray-700">
            🔄 التكرار 10 مرات (5 نقاط)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="recitedToPeer"
            checked={taskData.recitedToPeer}
            onChange={(e) => setTaskData({...taskData, recitedToPeer: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="recitedToPeer" className="mr-2 text-sm font-medium text-gray-700">
            👭 السرد على الرفيقة (5 نقاط)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 ملاحظات (اختياري)
          </label>
          <textarea
            value={taskData.notes}
            onChange={(e) => setTaskData({...taskData, notes: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="أي ملاحظات إضافية..."
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-lg font-semibold text-blue-900">
            🏆 مجموع النقاط اليوم: {calculatePoints()} نقطة
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors disabled:bg-gray-400"
        >
          {saving ? 'جاري الحفظ...' : '💾 حفظ المهام'}
        </button>
      </form>
        </div>
      </div>
    </div>
  );
}

export default function DailyTasksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-xl">جاري التحميل...</div></div>}>
      <DailyTasksContent />
    </Suspense>
  );
}
