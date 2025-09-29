'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Grade {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'final' | 'behavior';
  category: string;
  score: number;
  maxScore: number;
  date: string;
  courseName: string;
  teacherName: string;
  notes?: string;
}

interface GradeSummary {
  totalDailyGrades: number;
  totalWeeklyGrades: number;
  totalMonthlyGrades: number;
  finalExamGrade: number;
  behaviorGrade: number;
  totalPoints: number;
  finalPercentage: number;
}

export default function MyGradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [summary, setSummary] = useState<GradeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'daily' | 'weekly' | 'monthly' | 'final' | 'behavior'>('summary');

  const fetchMyGrades = useCallback(async () => {
    try {
      const response = await fetch('/api/grades/my-grades');
      if (!response.ok) {
        throw new Error('فشل في تحميل الدرجات');
      }
      const data = await response.json();
      setGrades(data.grades);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
      // بيانات احتياطية
      setGrades(getFallbackGrades());
      setSummary(getFallbackSummary());
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

    fetchMyGrades();
  }, [session, status, router, fetchMyGrades]);

  const getFallbackGrades = (): Grade[] => {
    return [
      {
        id: "1",
        type: "daily",
        category: "حفظ القرآن",
        score: 2.5,
        maxScore: 2.5,
        date: "2025-01-15",
        courseName: "حلقة الفجر",
        teacherName: "المعلمة سارة",
        notes: "ممتاز"
      },
      {
        id: "2",
        type: "daily",
        category: "التجويد",
        score: 2.0,
        maxScore: 2.5,
        date: "2025-01-15",
        courseName: "حلقة الفجر",
        teacherName: "المعلمة سارة",
        notes: "يحتاج تحسن"
      },
      {
        id: "3",
        type: "weekly",
        category: "المراجعة الأسبوعية",
        score: 4.5,
        maxScore: 5.0,
        date: "2025-01-14",
        courseName: "حلقة الفجر",
        teacherName: "المعلمة سارة"
      },
      {
        id: "4",
        type: "monthly",
        category: "الاختبار الشهري",
        score: 28,
        maxScore: 30,
        date: "2025-01-10",
        courseName: "حلقة الفجر",
        teacherName: "المعلمة سارة"
      },
      {
        id: "5",
        type: "behavior",
        category: "السلوك والمواظبة",
        score: 9,
        maxScore: 10,
        date: "2025-01-15",
        courseName: "حلقة الفجر",
        teacherName: "المعلمة سارة"
      }
    ];
  };

  const getFallbackSummary = (): GradeSummary => {
    return {
      totalDailyGrades: 315, // من أصل 700
      totalWeeklyGrades: 45, // من أصل 50
      totalMonthlyGrades: 85, // من أصل 90
      finalExamGrade: 55, // من أصل 60
      behaviorGrade: 63, // من أصل 70
      totalPoints: 563, // من أصل 970
      finalPercentage: 87.2 // النسبة المئوية
    };
  };

  const filterGradesByType = (type: string) => {
    return grades.filter(grade => grade.type === type);
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري تحميل الدرجات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">درجاتي</h1>
          <p className="text-gray-600">عرض تفصيلي لجميع درجاتك ونقاطك التحفيزية</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            {error} - يتم عرض بيانات تجريبية
          </div>
        )}

        {/* ملخص الدرجات */}
        {summary && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ملخص الدرجات</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.totalDailyGrades}</div>
                <div className="text-sm text-gray-600">درجات يومية</div>
                <div className="text-xs text-gray-500">من 700</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.totalWeeklyGrades}</div>
                <div className="text-sm text-gray-600">درجات أسبوعية</div>
                <div className="text-xs text-gray-500">من 50</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{summary.totalMonthlyGrades}</div>
                <div className="text-sm text-gray-600">درجات شهرية</div>
                <div className="text-xs text-gray-500">من 90</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{summary.finalExamGrade}</div>
                <div className="text-sm text-gray-600">الاختبار النهائي</div>
                <div className="text-xs text-gray-500">من 60</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{summary.behaviorGrade}</div>
                <div className="text-sm text-gray-600">السلوك</div>
                <div className="text-xs text-gray-500">من 70</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{summary.finalPercentage}%</div>
                <div className="text-sm text-gray-600">النسبة النهائية</div>
                <div className="text-xs text-gray-500">{summary.totalPoints} من 970</div>
              </div>
            </div>
          </div>
        )}

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'summary', label: 'الملخص' },
                { key: 'daily', label: 'الدرجات اليومية' },
                { key: 'weekly', label: 'الدرجات الأسبوعية' },
                { key: 'monthly', label: 'الدرجات الشهرية' },
                { key: 'final', label: 'الاختبار النهائي' },
                { key: 'behavior', label: 'السلوك والمواظبة' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* محتوى التبويبات */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">آخر الدرجات المسجلة</h3>
              <div className="grid gap-4">
                {grades.slice(0, 5).map((grade) => (
                  <div key={grade.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{grade.category}</div>
                      <div className="text-sm text-gray-600">{grade.courseName} - {new Date(grade.date).toLocaleDateString('ar-SA')}</div>
                    </div>
                    <div className={`text-lg font-bold ${getGradeColor(grade.score, grade.maxScore)}`}>
                      {grade.score}/{grade.maxScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab !== 'summary' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {activeTab === 'daily' && 'الدرجات اليومية'}
                {activeTab === 'weekly' && 'الدرجات الأسبوعية'}
                {activeTab === 'monthly' && 'الدرجات الشهرية'}
                {activeTab === 'final' && 'الاختبار النهائي'}
                {activeTab === 'behavior' && 'السلوك والمواظبة'}
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدرجة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحلقة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المعلمة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filterGradesByType(activeTab).map((grade) => (
                      <tr key={grade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(grade.date).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.category}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getGradeColor(grade.score, grade.maxScore)}`}>
                          {grade.score}/{grade.maxScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.teacherName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filterGradesByType(activeTab).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد درجات مسجلة لهذه الفئة بعد
                  </div>
                )}
              </div>
            </div>
          )}

          {/* زر العودة */}
          <div className="mt-6 pt-6 border-t border-gray-200">
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