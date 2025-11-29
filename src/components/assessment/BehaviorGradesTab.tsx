import React, { useState, useEffect, memo, useCallback } from 'react';
import { BehaviorGradeEntry } from '@/types/assessment';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface BehaviorGradesTabProps {
  courseId: string;
  date: string;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const BehaviorGradesTab = memo(({ courseId, date, onUnsavedChanges }: BehaviorGradesTabProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<{ [key: string]: { dailyScore: number; notes: string } }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const behaviorScoreValues = generateQuarterStepValues(1, 0.25);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/grades/behavior?courseId=${courseId}&date=${date}`);
      const data = await response.json();
      
      if (data.students) {
        setStudents(data.students);
        
        const gradesMap: any = {};
        data.students.forEach((student: any) => {
          gradesMap[student.id] = {
            dailyScore: student.behaviorGrade?.dailyScore || 0,
            notes: student.behaviorGrade?.notes || ''
          };
        });
        setGrades(gradesMap);
      }
    } catch (error) {
      console.error('خطأ في جلب الدرجات:', error);
      setMessage('❌ حدث خطأ في جلب الدرجات');
    } finally {
      setLoading(false);
    }
  }, [courseId, date]);

  useEffect(() => {
    if (courseId && date) {
      fetchGrades();
    }
  }, [courseId, date, fetchGrades]);

  const handleGradeChange = (studentId: string, field: 'dailyScore' | 'notes', value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const gradesArray = Object.entries(grades).map(([studentId, grade]) => ({
        studentId,
        dailyScore: Number(grade.dailyScore),
        notes: grade.notes
      }));

      const response = await fetch('/api/grades/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          date,
          grades: gradesArray
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ تم حفظ الدرجات بنجاح');
        onUnsavedChanges(false);
        await fetchGrades();
      } else {
        setMessage(`❌ ${data.error || 'فشل في حفظ الدرجات'}`);
      }
    } catch (error) {
      console.error('خطأ في حفظ الدرجات:', error);
      setMessage('❌ حدث خطأ في حفظ الدرجات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        السلوك والمواظبة - {new Date(date).toLocaleDateString('ar-EG')}
      </h3>

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
                الدرجة اليومية (0-1)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.studentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={grades[student.id]?.dailyScore || 0}
                    onChange={(e) => handleGradeChange(student.id, 'dailyScore', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {behaviorScoreValues.map((val) => (
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
          {saving ? 'جاري الحفظ...' : 'حفظ جميع الدرجات'}
        </button>
      </div>
    </div>
  );
});

BehaviorGradesTab.displayName = 'BehaviorGradesTab';
