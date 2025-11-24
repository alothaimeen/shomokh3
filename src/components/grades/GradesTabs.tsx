'use client';

import { useState } from 'react';

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
  taskPoints?: number;
  behaviorPoints?: number;
}

interface GradesTabsProps {
  grades: Grade[];
  summary: GradeSummary;
}

export default function GradesTabs({ grades, summary }: GradesTabsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'daily' | 'weekly' | 'monthly' | 'final' | 'behavior'>('summary');

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

  return (
    <>
      {/* ملخص الدرجات */}
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
            <div className="text-2xl font-bold text-indigo-600">{summary.finalPercentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">النسبة النهائية</div>
            <div className="text-xs text-gray-500">{summary.totalPoints} من 970</div>
          </div>
        </div>
        
        {/* النقاط التحفيزية */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
          <h3 className="text-lg font-bold text-purple-800 mb-3">🌟 النقاط التحفيزية</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {summary.taskPoints || 0}
              </div>
              <div className="text-sm text-gray-600">نقاط المهام اليومية</div>
              <div className="text-xs text-gray-500">من 1050 نقطة</div>
              <div className="text-xs text-purple-600 mt-1">
                السماع + التكرار + السرد
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-pink-600">
                {summary.behaviorPoints || 0}
              </div>
              <div className="text-sm text-gray-600">النقاط السلوكية</div>
              <div className="text-xs text-gray-500">من 1400 نقطة</div>
              <div className="text-xs text-pink-600 mt-1">
                الحضور + الحفظ + المشاركة + الالتزام
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-700">
                {(summary.taskPoints || 0) + (summary.behaviorPoints || 0)}
              </div>
              <div className="text-sm font-semibold text-purple-800">إجمالي النقاط</div>
              <div className="text-xs text-purple-600">من 2450 نقطة</div>
            </div>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
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
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
          <div>
            <h3 className="text-lg font-semibold mb-4">جميع الدرجات</h3>
            <div className="space-y-4">
              {grades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد درجات مسجلة بعد
                </div>
              ) : (
                grades.slice(0, 10).map((grade) => (
                  <div key={grade.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{grade.category}</h4>
                        <p className="text-sm text-gray-600">{grade.courseName}</p>
                        <p className="text-xs text-gray-500">{grade.teacherName}</p>
                      </div>
                      <div className="text-left">
                        <div className={`text-2xl font-bold ${getGradeColor(grade.score, grade.maxScore)}`}>
                          {grade.score}/{grade.maxScore}
                        </div>
                        <div className="text-xs text-gray-500">{grade.date}</div>
                      </div>
                    </div>
                    {grade.notes && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {grade.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {['daily', 'weekly', 'monthly', 'final', 'behavior'].map((type) => (
          activeTab === type && (
            <div key={type}>
              <h3 className="text-lg font-semibold mb-4">
                {type === 'daily' && 'الدرجات اليومية'}
                {type === 'weekly' && 'الدرجات الأسبوعية'}
                {type === 'monthly' && 'الدرجات الشهرية'}
                {type === 'final' && 'الاختبار النهائي'}
                {type === 'behavior' && 'درجات السلوك'}
              </h3>
              <div className="space-y-4">
                {filterGradesByType(type).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد درجات من هذا النوع
                  </div>
                ) : (
                  filterGradesByType(type).map((grade) => (
                    <div key={grade.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{grade.category}</h4>
                          <p className="text-sm text-gray-600">{grade.courseName}</p>
                          <p className="text-xs text-gray-500">{grade.teacherName}</p>
                        </div>
                        <div className="text-left">
                          <div className={`text-2xl font-bold ${getGradeColor(grade.score, grade.maxScore)}`}>
                            {grade.score}/{grade.maxScore}
                          </div>
                          <div className="text-xs text-gray-500">{grade.date}</div>
                        </div>
                      </div>
                      {grade.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {grade.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </>
  );
}
