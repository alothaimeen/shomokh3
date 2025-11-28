import React, { useState, useEffect, memo } from 'react';
import { BehaviorPointEntry } from '@/types/assessment';

interface BehaviorPointsTabProps {
  courseId: string;
  date: string;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

interface StudentPoints extends BehaviorPointEntry {
  studentName: string;
  studentNumber: number;
}

export const BehaviorPointsTab = memo(({ courseId, date, onUnsavedChanges }: BehaviorPointsTabProps) => {
  const [students, setStudents] = useState<StudentPoints[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (courseId && date) {
      fetchStudentsPoints();
    }
  }, [courseId, date]);

  const fetchStudentsPoints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/points/behavior?courseId=${courseId}&date=${date}`);
      const data = await response.json();
      
      if (data.students) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('خطأ في جلب النقاط:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (studentId: string, field: keyof BehaviorPointEntry) => {
    if (field === 'studentId' || field === 'notes') return;
    
    setStudents(prev => prev.map(student => 
      student.studentId === studentId
        ? { ...student, [field]: !(student[field as keyof StudentPoints] as boolean) }
        : student
    ));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const pointsArray = students.map(student => ({
        studentId: student.studentId,
        earlyAttendance: student.earlyAttendance,
        perfectMemorization: student.perfectMemorization,
        activeParticipation: student.activeParticipation,
        timeCommitment: student.timeCommitment,
        notes: student.notes || ''
      }));

      const response = await fetch('/api/points/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          date,
          points: pointsArray
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ تم حفظ النقاط بنجاح');
        onUnsavedChanges(false);
        await fetchStudentsPoints();
      } else {
        setMessage(`❌ ${data.error || 'فشل في حفظ النقاط'}`);
      }
    } catch (error) {
      console.error('خطأ في حفظ النقاط:', error);
      setMessage('❌ حدث خطأ في حفظ النقاط');
    } finally {
      setSaving(false);
    }
  };

  const calculateStudentPoints = (student: StudentPoints) => {
    return (
      (student.earlyAttendance ? 5 : 0) +
      (student.perfectMemorization ? 5 : 0) +
      (student.activeParticipation ? 5 : 0) +
      (student.timeCommitment ? 5 : 0)
    );
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        النقاط السلوكية - {new Date(date).toLocaleDateString('ar-EG')}
      </h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>ملاحظة:</strong> تقوم المعلمة برصد النقاط السلوكية لكل طالبة يومياً (20 نقطة كحد أقصى).
        </p>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                م
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-12 bg-gray-50 z-10">
                اسم الطالبة
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                حضور مبكر<br />(5)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                حفظ متقن<br />(5)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                مشاركة فعالة<br />(5)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                التزام بالوقت<br />(5)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50">
                المجموع<br />(20)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.studentId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 sticky right-0 bg-white">
                  {student.studentNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky right-12 bg-white">
                  {student.studentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={student.earlyAttendance}
                    onChange={() => handleCheckboxChange(student.studentId, 'earlyAttendance')}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={student.perfectMemorization}
                    onChange={() => handleCheckboxChange(student.studentId, 'perfectMemorization')}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={student.activeParticipation}
                    onChange={() => handleCheckboxChange(student.studentId, 'activeParticipation')}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={student.timeCommitment}
                    onChange={() => handleCheckboxChange(student.studentId, 'timeCommitment')}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-indigo-600 bg-indigo-50">
                  {calculateStudentPoints(student)} / 20
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
          {saving ? 'جاري الحفظ...' : 'حفظ جميع النقاط'}
        </button>
      </div>
    </div>
  );
});

BehaviorPointsTab.displayName = 'BehaviorPointsTab';
