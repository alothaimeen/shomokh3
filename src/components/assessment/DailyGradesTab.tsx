import React, { useState, useEffect, memo } from 'react';
import { DailyGradeEntry, Student } from '@/types/assessment';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface DailyGradesTabProps {
  courseId: string;
  date: string;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const DailyGradesTab = memo(({ courseId, date, onUnsavedChanges }: DailyGradesTabProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, DailyGradeEntry>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const gradeValues = generateQuarterStepValues(5, 0.25);

  useEffect(() => {
    if (courseId) {
      fetchStudents();
      fetchExistingGrades();
    }
  }, [courseId, date]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/enrollment/enrolled-students?courseId=${courseId}`);
      const data = await res.json();
      if (res.ok) {
        const studentsList = (data.enrollments || []).map((enrollment: any) => ({
          id: enrollment.student.id,
          studentName: enrollment.student.studentName,
          studentNumber: enrollment.student.studentNumber,
        }));
        setStudents(studentsList);
      }
    } catch (error) {
      console.error('خطأ في جلب الطالبات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingGrades = async () => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/grades/daily?courseId=${courseId}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      );
      const data = await res.json();

      if (res.ok && data.dailyGrades) {
        const existingGrades: Record<string, DailyGradeEntry> = {};
        data.dailyGrades.forEach((g: any) => {
          existingGrades[g.studentId] = {
            studentId: g.studentId,
            memorization: Number(g.memorization),
            review: Number(g.review),
            notes: g.notes || '',
          };
        });
        setGrades(existingGrades);
      }
    } catch (error) {
      console.error('خطأ في جلب الدرجات:', error);
    }
  };

  const handleGradeChange = (studentId: string, field: 'memorization' | 'review', value: number) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        memorization: field === 'memorization' ? value : prev[studentId]?.memorization || 0,
        review: field === 'review' ? value : prev[studentId]?.review || 0,
        notes: prev[studentId]?.notes || '',
      },
    }));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');

    try {
      const dateToSave = new Date(date);
      dateToSave.setHours(12, 0, 0, 0);

      const gradesArray = Object.values(grades).map((g) => ({
        studentId: g.studentId,
        memorization: g.memorization,
        review: g.review,
        notes: g.notes || '',
      }));

      const res = await fetch('/api/grades/daily/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          date: dateToSave.toISOString(),
          grades: gradesArray,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ تم حفظ الدرجات بنجاح');
        onUnsavedChanges(false);
      } else {
        setMessage(`❌ ${data.error || 'فشل الحفظ'}`);
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
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
        التقييم اليومي - {new Date(date).toLocaleDateString('ar-EG')}
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
                حفظ وتجويد (5)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                مراجعة وتجويد (5)
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
                    value={grades[student.id]?.memorization || 0}
                    onChange={(e) => handleGradeChange(student.id, 'memorization', Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {gradeValues.map((val) => (
                      <option key={val} value={val}>
                        {val.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={grades[student.id]?.review || 0}
                    onChange={(e) => handleGradeChange(student.id, 'review', Number(e.target.value))}
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
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ جميع الدرجات'}
        </button>
      </div>
    </div>
  );
});

DailyGradesTab.displayName = 'DailyGradesTab';
