import React, { useState, useEffect, memo } from 'react';
import { WeeklyGradeEntry, Student } from '@/types/assessment';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface WeeklyGradesTabProps {
  courseId: string;
  week: number;
  onWeekChange: (week: number) => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const WeeklyGradesTab = memo(({ courseId, week, onWeekChange, onUnsavedChanges }: WeeklyGradesTabProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [editedGrades, setEditedGrades] = useState<{ [studentId: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const gradeValues = generateQuarterStepValues(5, 0.25);

  useEffect(() => {
    if (courseId) {
      fetchWeeklyGrades();
    }
  }, [courseId, week]);

  const fetchWeeklyGrades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grades/weekly?courseId=${courseId}`);
      const data = await res.json();
      
      if (res.ok) {
        setStudents(data.students || []);
        
        const initialGrades: { [studentId: string]: number } = {};
        (data.students || []).forEach((student: any) => {
          initialGrades[student.studentId] = student.grades[week] !== undefined 
            ? student.grades[week] 
            : 0;
        });
        setEditedGrades(initialGrades);
      }
    } catch (error) {
      console.error('خطأ في جلب الدرجات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, value: number) => {
    setEditedGrades((prev) => ({
      ...prev,
      [studentId]: value,
    }));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const gradesArray = Object.entries(editedGrades).map(([studentId, grade]) => ({
        studentId,
        grade,
      }));

      const res = await fetch('/api/grades/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          week,
          grades: gradesArray,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        onUnsavedChanges(false);
        await fetchWeeklyGrades();
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
          التقييم الأسبوعي
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">الأسبوع:</label>
          <select
            value={week}
            onChange={(e) => onWeekChange(Number(e.target.value))}
            className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
              <option key={w} value={w}>
                الأسبوع {w}
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
                الدرجة (5)
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
                    value={editedGrades[student.studentId] || 0}
                    onChange={(e) => handleGradeChange(student.studentId, Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {gradeValues.map((val) => (
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

WeeklyGradesTab.displayName = 'WeeklyGradesTab';
