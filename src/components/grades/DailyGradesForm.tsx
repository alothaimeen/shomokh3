'use client';

import { useState, useTransition } from 'react';
import { saveDailyGrades } from '@/actions/grades';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface Student {
  id: string;
  studentName: string;
  studentNumber: number;
}

interface GradeEntry {
  studentId: string;
  memorization: number;
  review: number;
  notes?: string;
}

interface Props {
  students: Student[];
  courseId: string;
  selectedDate: string;
  existingGrades: GradeEntry[];
}

export default function DailyGradesForm({ students, courseId, selectedDate, existingGrades }: Props) {
  const [grades, setGrades] = useState<Record<string, GradeEntry>>(() => {
    const initial: Record<string, GradeEntry> = {};
    existingGrades.forEach(g => {
      initial[g.studentId] = g;
    });
    return initial;
  });
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const gradeValues = generateQuarterStepValues(5, 0.25);

  const handleGradeChange = (
    studentId: string,
    field: 'memorization' | 'review',
    value: number
  ) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        memorization: field === 'memorization' ? value : prev[studentId]?.memorization || 0,
        review: field === 'review' ? value : prev[studentId]?.review || 0,
        notes: prev[studentId]?.notes || '',
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const gradesToSave = Object.values(grades)
      .filter((g) => Number(g.memorization) > 0 || Number(g.review) > 0)
      .map((g) => ({
        studentId: g.studentId,
        memorization: Number(g.memorization),
        review: Number(g.review),
        notes: g.notes || '',
        date: new Date(selectedDate).toISOString(),
      }));

    if (gradesToSave.length === 0) {
      setMessage('⚠️ لا توجد درجات لحفظها (جميع القيم = 0)');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('grades', JSON.stringify(gradesToSave));

      const result = await saveDailyGrades(formData);
      if (result.success) {
        setMessage(`✅ ${result.message}`);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-right">م</th>
              <th className="px-4 py-3 text-right">اسم الطالبة</th>
              <th className="px-4 py-3 text-center">حفظ وتجويد (0-5)</th>
              <th className="px-4 py-3 text-center">مراجعة وتجويد (0-5)</th>
              <th className="px-4 py-3 text-center">المجموع اليومي</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  لا توجد طالبات مسجلات في هذه الحلقة
                </td>
              </tr>
            ) : (
              students.map((student, index) => {
                const studentGrade = grades[student.id] || {
                  memorization: 0,
                  review: 0,
                };
                const dailyTotal = studentGrade.memorization + studentGrade.review;

                return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold">{student.studentName}</td>
                    <td className="px-4 py-3">
                      <select
                        value={studentGrade.memorization}
                        onChange={(e) =>
                          handleGradeChange(student.id, 'memorization', parseFloat(e.target.value))
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-purple-500 focus:outline-none"
                      >
                        {gradeValues.map((val) => (
                          <option key={val} value={val}>
                            {val.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={studentGrade.review}
                        onChange={(e) =>
                          handleGradeChange(student.id, 'review', parseFloat(e.target.value))
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                      >
                        {gradeValues.map((val) => (
                          <option key={val} value={val}>
                            {val.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-lg">
                      {dailyTotal.toFixed(2)} / 10
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isPending}
            className={`px-8 py-4 rounded-lg text-xl font-bold text-white transition-all ${
              isPending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg'
            }`}
          >
            {isPending ? '⏳ جاري الحفظ...' : '💾 حفظ جميع الدرجات'}
          </button>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          💡 الدرجة اليومية الكاملة: 10 درجات (5 حفظ + 5 مراجعة) | المجموع الخام على 70 يوم: 700 درجة
        </p>
      </div>
    </form>
  );
}
