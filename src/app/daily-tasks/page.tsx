'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DailyTask {
  id: string;
  taskType: 'listening' | 'repetition' | 'narration';
  taskName: string;
  description: string;
  points: number;
  maxOccurrences: number;
  currentOccurrences: number;
  completed: boolean;
  date: string;
}

interface TaskProgress {
  totalPointsToday: number;
  maxPointsPerDay: number;
  weeklyProgress: number;
  totalPointsWeek: number;
  maxPointsPerWeek: number;
}

export default function DailyTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchDailyTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks/daily-tasks');
      if (!response.ok) {
        throw new Error('فشل في تحميل المهام');
      }
      const data = await response.json();
      setTasks(data.tasks);
      setProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
      // بيانات احتياطية
      setTasks(getFallbackTasks());
      setProgress(getFallbackProgress());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.userRole !== 'STUDENT') {
      router.push('/dashboard');
      return;
    }

    fetchDailyTasks();
  }, [session, status, router, fetchDailyTasks]);

  const getFallbackTasks = (): DailyTask[] => {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: "task-1",
        taskType: "listening",
        taskName: "السماع",
        description: "الاستماع للصفحات المحددة من المعلمة",
        points: 1,
        maxOccurrences: 5,
        currentOccurrences: 3,
        completed: false,
        date: today
      },
      {
        id: "task-2",
        taskType: "repetition",
        taskName: "التكرار",
        description: "تكرار الآيات المحفوظة حديثاً",
        points: 0.5,
        maxOccurrences: 10,
        currentOccurrences: 6,
        completed: false,
        date: today
      },
      {
        id: "task-3",
        taskType: "narration",
        taskName: "السرد على الرفيقة",
        description: "سرد ما تم حفظه على رفيقة في الحلقة",
        points: 5,
        maxOccurrences: 1,
        currentOccurrences: 0,
        completed: false,
        date: today
      }
    ];
  };

  const getFallbackProgress = (): TaskProgress => {
    return {
      totalPointsToday: 8, // 3×1 + 6×0.5 + 0×5
      maxPointsPerDay: 15, // 5×1 + 10×0.5 + 1×5
      weeklyProgress: 65, // نسبة مئوية
      totalPointsWeek: 68,
      maxPointsPerWeek: 105 // 15×7
    };
  };

  const handleCompleteTask = async (taskId: string) => {
    setSubmitting(taskId);
    try {
      const response = await fetch('/api/tasks/complete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        throw new Error('فشل في تسجيل المهمة');
      }

      const data = await response.json();

      // تحديث المهمة محلياً
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                currentOccurrences: Math.min(task.currentOccurrences + 1, task.maxOccurrences),
                completed: task.currentOccurrences + 1 >= task.maxOccurrences
              }
            : task
        )
      );

      // تحديث التقدم
      if (progress) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          setProgress(prev => prev ? {
            ...prev,
            totalPointsToday: prev.totalPointsToday + task.points,
            totalPointsWeek: prev.totalPointsWeek + task.points
          } : null);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تسجيل المهمة');
    } finally {
      setSubmitting(null);
    }
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'listening': return '🎧';
      case 'repetition': return '🔄';
      case 'narration': return '👥';
      default: return '📝';
    }
  };

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري تحميل المهام...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">المهام اليومية</h1>
          <p className="text-gray-600">سجلي مهامك اليومية لكسب النقاط التحفيزية</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            {error} - يتم عرض بيانات تجريبية
          </div>
        )}

        {/* ملخص التقدم */}
        {progress && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">تقدم اليوم</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* النقاط اليومية */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">النقاط اليوم</span>
                  <span className="text-sm text-gray-600">{progress.totalPointsToday}/{progress.maxPointsPerDay}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(progress.totalPointsToday, progress.maxPointsPerDay)}`}
                    style={{ width: `${Math.min((progress.totalPointsToday / progress.maxPointsPerDay) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((progress.totalPointsToday / progress.maxPointsPerDay) * 100)}% مكتمل
                </p>
              </div>

              {/* النقاط الأسبوعية */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">النقاط هذا الأسبوع</span>
                  <span className="text-sm text-gray-600">{progress.totalPointsWeek}/{progress.maxPointsPerWeek}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getProgressColor(progress.totalPointsWeek, progress.maxPointsPerWeek)}`}
                    style={{ width: `${Math.min((progress.totalPointsWeek / progress.maxPointsPerWeek) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.weeklyProgress}% من الهدف الأسبوعي
                </p>
              </div>
            </div>
          </div>
        )}

        {/* قائمة المهام */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">المهام المتاحة</h2>

          {tasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-lg shadow-lg p-6 border-r-4 ${
              task.completed ? 'border-green-500 bg-green-50' : 'border-blue-500'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTaskIcon(task.taskType)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{task.taskName}</h3>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-blue-600">{task.points}</div>
                  <div className="text-xs text-gray-500">نقطة</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-700">التقدم:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {task.currentOccurrences}/{task.maxOccurrences}
                    </span>
                  </div>
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(task.currentOccurrences, task.maxOccurrences)}`}
                      style={{ width: `${(task.currentOccurrences / task.maxOccurrences) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  {task.completed ? (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                      ✓ مكتملة
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={submitting === task.id}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        submitting === task.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {submitting === task.id ? 'جاري التسجيل...' : 'سجل إنجاز'}
                    </button>
                  )}
                </div>
              </div>

              {task.currentOccurrences > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    تم إنجاز {task.currentOccurrences} مرة اليوم •
                    كسبت {task.currentOccurrences * task.points} نقطة
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* معلومات إضافية */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 نصائح لكسب النقاط</h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>السماع: استمعي لكل صفحة 5 مرات للحصول على 5 نقاط</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>التكرار: كرري الآيات 10 مرات للحصول على 5 نقاط</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>السرد: اسردي على رفيقة للحصول على 5 نقاط</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span className="font-medium">المجموع اليومي: 15 نقطة × 70 يوم = 1050 نقطة تحفيزية</span>
            </li>
          </ul>
        </div>

        {/* زر العودة */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
}