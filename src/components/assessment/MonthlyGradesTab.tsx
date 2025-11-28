import React, { useState, useEffect, memo } from 'react';
import { MonthlyGradeEntry } from '@/types/assessment';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface MonthlyGradesTabProps {
  courseId: string;
  month: number;
  onMonthChange: (month: number) => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const MonthlyGradesTab = memo(({ courseId, month, onMonthChange, onUnsavedChanges }: MonthlyGradesTabProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [editedGrades, setEditedGrades] = useState<{
    [studentId: string]: {
      quranForgetfulness: number;
      quranMajorMistakes: number;
      quranMinorMistakes: number;
      tajweedTheory: number;
    };
  }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const quranGradeValues = generateQuarterStepValues(5, 0.25);
  const tajweedGradeValues = generateQuarterStepValues(15, 0.25);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (courseId) {
      fetchMonthlyGrades();
    }
  }, [courseId, month]);

  const fetchMonthlyGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grades/monthly?courseId=${courseId}`);
      const data = await res.json();
      
      if (res.ok) {
        setStudents(data.students || []);
        
        const initialGrades: typeof editedGrades = {};
        (data.students || []).forEach((student: any) => {
          const monthData = student.grades[month];
          initialGrades[student.studentId] = {
            quranForgetfulness: monthData ? monthData.quranForgetfulness : 0,
            quranMajorMistakes: monthData ? monthData.quranMajorMistakes : 0,
            quranMinorMistakes: monthData ? monthData.quranMinorMistakes : 0,
            tajweedTheory: monthData ? monthData.tajweedTheory : 0,
          };
        });
        setEditedGrades(initialGrades);
      }
    } catch (error) {
      console.error('خطأ في جلب الدرجات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (
    studentId: string,
    field: keyof MonthlyGradeEntry,
    value: number
  ) => {
    if (field === 'studentId') return;
    
    setEditedGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const gradesArray = Object.entries(editedGrades).map(([studentId, grades]) => ({
        studentId,
        ...grades,
      }));

      const res = await fetch('/api/grades/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          month,
          grades: gradesArray,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        onUnsavedChanges(false);
        await fetchMonthlyGrades();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('خطأ في حفظ الدرجات:', error);
      setMessage('❌ حدث خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          التقييم الشهري
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">الشهر:</label>
          <select
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {[1, 2, 3].map((m) => (
              <option key={m} value={m}>
                الشهر {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                م
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم الطالبة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نسيان (5)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                لحن جلي (5)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                لحن خفي (5)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تجويد نظري (15)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.studentId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.studentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={editedGrades[student.studentId]?.quranForgetfulness || 0}
                    onChange={(e) => handleGradeChange(student.studentId, 'quranForgetfulness', Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {quranGradeValues.map((val) => (
                      <option key={val} value={val}>
                        {val.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={editedGrades[student.studentId]?.quranMajorMistakes || 0}
                    onChange={(e) => handleGradeChange(student.studentId, 'quranMajorMistakes', Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {quranGradeValues.map((val) => (
                      <option key={val} value={val}>
                        {val.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={editedGrades[student.studentId]?.quranMinorMistakes || 0}
                    onChange={(e) => handleGradeChange(student.studentId, 'quranMinorMistakes', Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {quranGradeValues.map((val) => (
                      <option key={val} value={val}>
                        {val.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={editedGrades[student.studentId]?.tajweedTheory || 0}
                    onChange={(e) => handleGradeChange(student.studentId, 'tajweedTheory', Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {tajweedGradeValues.map((val) => (
                      <option key={val} value={val}>
                        {val.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الدرجات'}
        </button>
      </div>
    </div>
  );
});

MonthlyGradesTab.displayName = 'MonthlyGradesTab';
