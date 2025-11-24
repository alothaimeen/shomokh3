'use client';

import { useState, useTransition } from 'react';
import { saveWeeklyGrade } from '@/actions/grades';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface StudentGrade {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentNumber: number;
  grades: { [week: number]: number };
  total: number;
}

interface Props {
  students: StudentGrade[];
  selectedWeek: number;
}

export default function WeeklyGradesForm({ students, selectedWeek }: Props) {
  const [editedGrades, setEditedGrades] = useState<{ [studentId: string]: number }>(() => {
    const initial: { [studentId: string]: number } = {};
    students.forEach((student) => {
      initial[student.studentId] = student.grades[selectedWeek] ?? 5;
    });
    return initial;
  });
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const gradeValues = generateQuarterStepValues(5, 0.25);

  const handleGradeChange = (studentId: string, grade: number) => {
    setEditedGrades((prev) => ({ ...prev, [studentId]: grade }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const saves = students.map(async (student) => {
      const formData = new FormData();
      formData.append('enrollmentId', student.enrollmentId);
      formData.append('week', selectedWeek.toString());
      formData.append('grade', editedGrades[student.studentId].toString());
      return await saveWeeklyGrade(formData);
    });

    startTransition(async () => {
      const results = await Promise.all(saves);
      const failed = results.filter((r) => !r.success).length;
      if (failed === 0) {
        setMessage(`✅ تم حفظ درجات ${students.length} طالبة`);
      } else {
        setMessage(`⚠️ تم حفظ ${students.length - failed} وفشل ${failed}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-right">م</th>
              <th className="px-4 py-3 text-right">اسم الطالبة</th>
              <th className="px-4 py-3 text-center">الأسبوع {selectedWeek}</th>
              <th className="px-4 py-3 text-center">المجموع الكلي</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.studentId} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-semibold">{student.studentName}</td>
                <td className="px-4 py-3">
                  <select
                    value={editedGrades[student.studentId]}
                    onChange={(e) => handleGradeChange(student.studentId, parseFloat(e.target.value))}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-purple-500"
                  >
                    {gradeValues.map((val) => (
                      <option key={val} value={val}>
                        {val.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-center font-bold">{student.total.toFixed(2)} / 50</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isPending}
            className={`px-8 py-4 rounded-lg text-xl font-bold text-white ${
              isPending ? 'bg-gray-400' : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700'
            }`}
          >
            {isPending ? '⏳ جاري الحفظ...' : '💾 حفظ الدرجات'}
          </button>
        </div>
      )}
    </form>
  );
}
