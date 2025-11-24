'use client';

import { useState, useTransition } from 'react';
import { saveMonthlyGrade } from '@/actions/grades';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface MonthGrade {
  quranForgetfulness: number;
  quranMajorMistakes: number;
  quranMinorMistakes: number;
  tajweedTheory: number;
  total: number;
}

interface StudentGrade {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentNumber: number;
  grades: { [month: number]: MonthGrade };
  total: number;
}

interface Props {
  students: StudentGrade[];
  selectedMonth: number;
}

export default function MonthlyGradesForm({ students, selectedMonth }: Props) {
  const [editedGrades, setEditedGrades] = useState<{
    [studentId: string]: {
      quranForgetfulness: number;
      quranMajorMistakes: number;
      quranMinorMistakes: number;
      tajweedTheory: number;
    };
  }>(() => {
    const initial: any = {};
    students.forEach((student) => {
      const monthData = student.grades[selectedMonth];
      initial[student.studentId] = {
        quranForgetfulness: monthData?.quranForgetfulness || 5,
        quranMajorMistakes: monthData?.quranMajorMistakes || 5,
        quranMinorMistakes: monthData?.quranMinorMistakes || 5,
        tajweedTheory: monthData?.tajweedTheory || 15,
      };
    });
    return initial;
  });
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const quranGradeValues = generateQuarterStepValues(5, 0.25);
  const tajweedGradeValues = generateQuarterStepValues(15, 0.25);

  const handleGradeChange = (
    studentId: string,
    field: keyof MonthGrade,
    value: number
  ) => {
    setEditedGrades((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const saves = students.map(async (student) => {
      const formData = new FormData();
      formData.append('enrollmentId', student.enrollmentId);
      formData.append('month', selectedMonth.toString());
      formData.append('quranForgetfulness', editedGrades[student.studentId].quranForgetfulness.toString());
      formData.append('quranMajorMistakes', editedGrades[student.studentId].quranMajorMistakes.toString());
      formData.append('quranMinorMistakes', editedGrades[student.studentId].quranMinorMistakes.toString());
      formData.append('tajweedTheory', editedGrades[student.studentId].tajweedTheory.toString());
      return await saveMonthlyGrade(formData);
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
              <th className="px-4 py-3 text-center">نسيان القرآن (0-5)</th>
              <th className="px-4 py-3 text-center">لحن جلي (0-5)</th>
              <th className="px-4 py-3 text-center">لحن خفي (0-5)</th>
              <th className="px-4 py-3 text-center">تجويد نظري (0-15)</th>
              <th className="px-4 py-3 text-center">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const grades = editedGrades[student.studentId];
              const monthTotal =
                grades.quranForgetfulness +
                grades.quranMajorMistakes +
                grades.quranMinorMistakes +
                grades.tajweedTheory;

              return (
                <tr key={student.studentId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold">{student.studentName}</td>
                  <td className="px-4 py-3">
                    <select
                      value={grades.quranForgetfulness}
                      onChange={(e) =>
                        handleGradeChange(student.studentId, 'quranForgetfulness', parseFloat(e.target.value))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center"
                    >
                      {quranGradeValues.map((val) => (
                        <option key={val} value={val}>
                          {val.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={grades.quranMajorMistakes}
                      onChange={(e) =>
                        handleGradeChange(student.studentId, 'quranMajorMistakes', parseFloat(e.target.value))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center"
                    >
                      {quranGradeValues.map((val) => (
                        <option key={val} value={val}>
                          {val.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={grades.quranMinorMistakes}
                      onChange={(e) =>
                        handleGradeChange(student.studentId, 'quranMinorMistakes', parseFloat(e.target.value))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center"
                    >
                      {quranGradeValues.map((val) => (
                        <option key={val} value={val}>
                          {val.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={grades.tajweedTheory}
                      onChange={(e) =>
                        handleGradeChange(student.studentId, 'tajweedTheory', parseFloat(e.target.value))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center"
                    >
                      {tajweedGradeValues.map((val) => (
                        <option key={val} value={val}>
                          {val.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{monthTotal.toFixed(2)} / 30</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isPending}
            className={`px-8 py-4 rounded-lg text-xl font-bold text-white ${
              isPending ? 'bg-gray-400' : 'bg-gradient-to-r from-green-600 to-teal-600'
            }`}
          >
            {isPending ? '⏳ جاري الحفظ...' : '💾 حفظ الدرجات'}
          </button>
        </div>
      )}
    </form>
  );
}
