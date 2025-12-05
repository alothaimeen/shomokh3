'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { saveBehaviorGrades } from '@/actions/grades';
import DualDatePicker from '@/components/shared/DualDatePicker';

interface Course {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  studentsCount: number;
}

interface BehaviorGrade {
  dailyScore: number;
  notes: string | null;
}

interface Student {
  id: string;
  studentName: string;
  studentNumber: number;
  studentPhone: string;
  behaviorGrade: BehaviorGrade | null;
}

interface BehaviorGradesFormProps {
  courses: Course[];
  selectedCourseId: string;
  selectedDate: string;
  students: Student[];
}

const gradeOptions = [
  { value: '1', label: 'ممتاز (1)' },
  { value: '0.75', label: 'جيد جداً (0.75)' },
  { value: '0.5', label: 'جيد (0.5)' },
  { value: '0.25', label: 'متوسط (0.25)' },
  { value: '0', label: 'ضعيف (0)' }
];

export default function BehaviorGradesForm({ 
  courses, 
  selectedCourseId, 
  selectedDate,
  students 
}: BehaviorGradesFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [grades, setGrades] = useState<{ [key: string]: { dailyScore: string; notes: string } }>(() => {
    const initialGrades: any = {};
    students.forEach(student => {
      initialGrades[student.id] = {
        dailyScore: student.behaviorGrade?.dailyScore?.toString() || '1',
        notes: student.behaviorGrade?.notes || ''
      };
    });
    return initialGrades;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleCourseChange = (courseId: string) => {
    router.push(`${pathname}?courseId=${courseId}&date=${selectedDate}`);
  };

  const handleDateChange = (date: string) => {
    router.push(`${pathname}?courseId=${selectedCourseId}&date=${date}`);
  };

  const handleGradeChange = (studentId: string, field: 'dailyScore' | 'notes', value: string) => {
    setMessage('');
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    const gradesArray = Object.entries(grades).map(([studentId, grade]) => ({
      studentId,
      dailyScore: parseFloat(grade.dailyScore) || 0,
      notes: grade.notes || ''
    }));

    for (const grade of gradesArray) {
      if (grade.dailyScore < 0 || grade.dailyScore > 1) {
        setMessage('❌ درجة السلوك يجب أن تكون بين 0 و 1');
        return;
      }
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourseId);
      formData.append('date', selectedDate);
      formData.append('grades', JSON.stringify(gradesArray));

      const result = await saveBehaviorGrades(formData);

      if (result.success) {
        setMessage('✅ تم حفظ درجات السلوك بنجاح');
        router.refresh();
      } else {
        setMessage('❌ ' + (result.error || 'حدث خطأ في حفظ الدرجات'));
      }
    } catch (error) {
      setMessage('❌ حدث خطأ في حفظ الدرجات');
      console.error('Error saving grades:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourseId);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختيار الحلقة
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.programName} - {course.courseName} (المستوى {course.level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التاريخ
          </label>
          <DualDatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            maxDate={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-800">
            {selectedCourseData?.courseName} - {selectedDate}
          </h2>
          <div className="text-sm text-gray-600">
            المجموع الكلي: 70 درجة (70 يوم × 1 درجة)
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد طالبات مسجلات في هذه الحلقة
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-100 sticky top-0">
                <tr>
                  <th className="p-3 text-right border">#</th>
                  <th className="p-3 text-right border min-w-[200px]">اسم الطالبة</th>
                  <th className="p-3 text-center border">
                    درجة السلوك اليومية<br/>
                    <span className="text-xs text-gray-600">(0-1)</span>
                  </th>
                  <th className="p-3 text-right border min-w-[250px]">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const studentGrades = grades[student.id] || { dailyScore: '1', notes: '' };
                  
                  return (
                    <tr key={student.id} className="hover:bg-amber-50">
                      <td className="p-3 border text-center">{index + 1}</td>
                      <td className="p-3 border">{student.studentName}</td>
                      <td className="p-3 border">
                        <select
                          value={studentGrades.dailyScore}
                          onChange={(e) => handleGradeChange(student.id, 'dailyScore', e.target.value)}
                          className="w-full p-2 border rounded text-center focus:ring-2 focus:ring-amber-500"
                        >
                          {gradeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 border">
                        <input
                          type="text"
                          value={studentGrades.notes}
                          onChange={(e) => handleGradeChange(student.id, 'notes', e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-amber-500"
                          placeholder="ملاحظات..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message}
          </div>
        )}

        {students.length > 0 && (
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-amber-300"
            >
              {saving ? 'جاري الحفظ...' : '💾 حفظ جميع الدرجات'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-bold text-blue-800 mb-2">📋 تعليمات:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• الدرجة من 0 إلى 1 لكل يوم</li>
          <li>• ممتاز (1) - جيد جداً (0.75) - جيد (0.5) - متوسط (0.25) - ضعيف (0)</li>
          <li>• يتم تجميع الدرجات اليومية للحصول على المجموع الكلي (70 درجة)</li>
          <li>• يمكن إضافة ملاحظات لكل طالبة</li>
        </ul>
      </div>
    </>
  );
}
