'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabType, TAB_CONFIGS } from '@/types/assessment';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { AssessmentSkeleton } from '@/components/assessment/AssessmentSkeleton';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import CourseSelectorAsync from '@/components/unified-assessment/CourseSelectorAsync';
import HeaderSkeleton from '@/components/unified-assessment/HeaderSkeleton';
import DualDatePicker from '@/components/shared/DualDatePicker';

// Lazy load all tab components
const DailyGradesTab = lazy(() => import('@/components/assessment/DailyGradesTab').then(m => ({ default: m.DailyGradesTab })));
const WeeklyGradesTab = lazy(() => import('@/components/assessment/WeeklyGradesTab').then(m => ({ default: m.WeeklyGradesTab })));
const MonthlyGradesTab = lazy(() => import('@/components/assessment/MonthlyGradesTab').then(m => ({ default: m.MonthlyGradesTab })));
const FinalExamTab = lazy(() => import('@/components/assessment/FinalExamTab').then(m => ({ default: m.FinalExamTab })));

function UnifiedAssessmentContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // تحذير عند المغادرة بدون حفظ
  useUnsavedChanges(hasUnsavedChanges);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Sync with URL parameters
      const courseId = searchParams.get('courseId');
      const tab = searchParams.get('tab') as TabType;
      const date = searchParams.get('date');
      const week = searchParams.get('week');
      const month = searchParams.get('month');

      if (courseId) setSelectedCourse(courseId);
      if (tab && TAB_CONFIGS.find(t => t.id === tab)) setActiveTab(tab);
      if (date) setSelectedDate(date);
      if (week) setSelectedWeek(Number(week));
      if (month) setSelectedMonth(Number(month));
    }
  }, [status, router, searchParams]);

  const updateURL = (updates: Partial<{ tab: TabType; courseId: string; date: string; week: number; month: number }>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.courseId !== undefined) params.set('courseId', updates.courseId);
    if (updates.tab) params.set('tab', updates.tab);
    if (updates.date) params.set('date', updates.date);
    if (updates.week) params.set('week', String(updates.week));
    if (updates.month) params.set('month', String(updates.month));

    router.push(`/unified-assessment?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (tab: TabType) => {
    if (hasUnsavedChanges) {
      if (!confirm('لديك تعديلات غير محفوظة. هل تريد المتابعة؟')) {
        return;
      }
      setHasUnsavedChanges(false);
    }

    setActiveTab(tab);
    updateURL({ tab });
  };

  const handleCourseChange = (courseId: string) => {
    if (hasUnsavedChanges) {
      if (!confirm('لديك تعديلات غير محفوظة. هل تريد المتابعة؟')) {
        return;
      }
      setHasUnsavedChanges(false);
    }

    setSelectedCourse(courseId);
    updateURL({ courseId });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isTeacherOrAdmin = session.user.role === 'ADMIN' || session.user.role === 'TEACHER';

  return (
    <>
      <AppHeader title="واجهة الدرجات الموحدة" />
        <div className="p-8">
          <BackButton />
          {/* Header - يظهر فوراً */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent mb-2">
              الصفحة الموحدة للتقييم
            </h1>
            <p className="text-gray-600">
              {isTeacherOrAdmin
                ? 'إدارة جميع أنواع التقييم من صفحة واحدة'
                : 'عرض جميع درجاتك ومهامك من صفحة واحدة'
              }
            </p>
          </div>

          {/* Course Selection مع Suspense */}
          <Suspense fallback={<HeaderSkeleton />}>
            <CourseSelectorAsync 
              selectedCourse={selectedCourse}
              onCourseChange={handleCourseChange}
            />
          </Suspense>

          {selectedCourse ? (
            <>
              {/* Tabs Navigation - 4 tabs only */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {TAB_CONFIGS.map((tab) => {
                    // Show only 4 main tabs: daily, weekly, monthly, final
                    if (!['daily', 'weekly', 'monthly', 'final'].includes(tab.id)) {
                      return null;
                    }

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-primary-purple to-primary-blue text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {tab.label}
                        {hasUnsavedChanges && activeTab === tab.id && (
                          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selector for Daily Tab */}
              {activeTab === 'daily' && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ:
                  </label>
                  <DualDatePicker
                    selectedDate={selectedDate}
                    onDateChange={(date) => {
                      setSelectedDate(date);
                      updateURL({ date });
                    }}
                    maxDate={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {/* Tab Content - 4 tabs only */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Suspense fallback={<AssessmentSkeleton />}>
                  {activeTab === 'daily' && (
                    <DailyGradesTab
                      courseId={selectedCourse}
                      date={selectedDate}
                      onUnsavedChanges={setHasUnsavedChanges}
                    />
                  )}
                  {activeTab === 'weekly' && (
                    <WeeklyGradesTab
                      courseId={selectedCourse}
                      week={selectedWeek}
                      onWeekChange={(week) => {
                        setSelectedWeek(week);
                        updateURL({ week });
                      }}
                      onUnsavedChanges={setHasUnsavedChanges}
                    />
                  )}
                  {activeTab === 'monthly' && (
                    <MonthlyGradesTab
                      courseId={selectedCourse}
                      month={selectedMonth}
                      onMonthChange={(month) => {
                        setSelectedMonth(month);
                        updateURL({ month });
                      }}
                      onUnsavedChanges={setHasUnsavedChanges}
                    />
                  )}
                  {activeTab === 'final' && (
                    <FinalExamTab
                      courseId={selectedCourse}
                      onUnsavedChanges={setHasUnsavedChanges}
                    />
                  )}
                </Suspense>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">
                الرجاء اختيار الحلقة أولاً للبدء في التقييم
              </p>
            </div>
          )}
        </div>
    </>
  );
}

export default function UnifiedAssessmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="text-xl">جاري التحميل...</div></div>}>
      <UnifiedAssessmentContent />
    </Suspense>
  );
}
