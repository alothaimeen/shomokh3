'use client';

import { useState, useTransition } from 'react';
import { saveBehaviorPoints } from '@/actions/grades';

interface StudentPoints {
  studentId: string;
  studentName: string;
  date: string;
  earlyAttendance: boolean;
  perfectMemorization: boolean;
  activeParticipation: boolean;
  timeCommitment: boolean;
  notes?: string;
}

interface Props {
  students: StudentPoints[];
  courseId: string;
  selectedDate: string;
}

export default function BehaviorPointsForm({ students: initialStudents, courseId, selectedDate }: Props) {
  const [students, setStudents] = useState<StudentPoints[]>(initialStudents);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCheckboxChange = (studentId: string, field: keyof Omit<StudentPoints, 'studentId' | 'studentName' | 'date' | 'notes'>) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, [field]: !student[field] } : student
      )
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, notes } : student
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append(
        'points',
        JSON.stringify(
          students.map((s) => ({
            studentId: s.studentId,
            date: selectedDate,
            earlyAttendance: s.earlyAttendance,
            perfectMemorization: s.perfectMemorization,
            activeParticipation: s.activeParticipation,
            timeCommitment: s.timeCommitment,
            notes: s.notes || '',
          }))
        )
      );

      const result = await saveBehaviorPoints(formData);
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

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-right">اسم الطالبة</th>
              <th className="px-4 py-3 text-center">حضور مبكر</th>
              <th className="px-4 py-3 text-center">حفظ متقن</th>
              <th className="px-4 py-3 text-center">مشاركة فعالة</th>
              <th className="px-4 py-3 text-center">الالتزام بالوقت</th>
              <th className="px-4 py-3 text-center">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.studentId} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{student.studentName}</td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={student.earlyAttendance}
                    onChange={() => handleCheckboxChange(student.studentId, 'earlyAttendance')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={student.perfectMemorization}
                    onChange={() => handleCheckboxChange(student.studentId, 'perfectMemorization')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={student.activeParticipation}
                    onChange={() => handleCheckboxChange(student.studentId, 'activeParticipation')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={student.timeCommitment}
                    onChange={() => handleCheckboxChange(student.studentId, 'timeCommitment')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={student.notes || ''}
                    onChange={(e) => handleNotesChange(student.studentId, e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                    placeholder="ملاحظات..."
                  />
                </td>
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
              isPending ? 'bg-gray-400' : 'bg-gradient-to-r from-green-600 to-teal-600'
            }`}
          >
            {isPending ? '⏳ جاري الحفظ...' : '💾 حفظ النقاط'}
          </button>
        </div>
      )}
    </form>
  );
}
