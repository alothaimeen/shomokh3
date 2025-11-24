'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { saveFinalExamGrades } from '@/actions/grades';

interface Course {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  studentsCount: number;
}

interface FinalExam {
  quranTest: number;
  tajweedTest: number;
  notes: string | null;
}

interface Student {
  id: string;
  studentName: string;
  studentNumber: number;
  studentPhone: string;
  finalExam: FinalExam | null;
}

interface FinalExamFormProps {
  courses: Course[];
  selectedCourseId: string;
  students: Student[];
}

export default function FinalExamForm({ courses, selectedCourseId, students }: FinalExamFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [grades, setGrades] = useState<{ [key: string]: { quranTest: string; tajweedTest: string; notes: string } }>(() => {
    const initialGrades: any = {};
    students.forEach(student => {
      initialGrades[student.id] = {
        quranTest: student.finalExam?.quranTest?.toString() || '40',
        tajweedTest: student.finalExam?.tajweedTest?.toString() || '20',
        notes: student.finalExam?.notes || ''
      };
    });
    return initialGrades;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleCourseChange = (courseId: string) => {
    router.push(`${pathname}?courseId=${courseId}`);
  };

  const handleGradeChange = (studentId: string, field: 'quranTest' | 'tajweedTest' | 'notes', value: string) => {
    setMessage('');
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const calculateTotal = (quranTest: string, tajweedTest: string) => {
    const quran = parseFloat(quranTest) || 0;
    const tajweed = parseFloat(tajweedTest) || 0;
    return (quran + tajweed).toFixed(2);
  };

  const handleSave = async () => {
    const gradesArray = Object.entries(grades).map(([studentId, grade]) => ({
      studentId,
      quranTest: parseFloat(grade.quranTest) || 0,
      tajweedTest: parseFloat(grade.tajweedTest) || 0,
      notes: grade.notes || ''
    }));

    for (const grade of gradesArray) {
      if (grade.quranTest < 0 || grade.quranTest > 40) {
        setMessage('❌ درجة القرآن يجب أن تكون بين 0 و 40');
        return;
      }
      if (grade.tajweedTest < 0 || grade.tajweedTest > 20) {
        setMessage('❌ درجة التجويد يجب أن تكون بين 0 و 20');
        return;
      }
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourseId);
      formData.append('grades', JSON.stringify(gradesArray));

      const result = await saveFinalExamGrades(formData);

      if (result.success) {
        setMessage('✅ تم حفظ الدرجات بنجاح');
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-800">
            {selectedCourseData?.courseName}
          </h2>
          <div className="text-sm text-gray-600">
            إجمالي: 60 درجة (القرآن 40 + التجويد 20)
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد طالبات مسجلات في هذه الحلقة
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-100 sticky top-0">
                <tr>
                  <th className="p-3 text-right border">#</th>
                  <th className="p-3 text-right border min-w-[200px]">اسم الطالبة</th>
                  <th className="p-3 text-center border">
                    اختبار القرآن<br/>
                    <span className="text-xs text-gray-600">(0-40)</span>
                  </th>
                  <th className="p-3 text-center border">
                    اختبار التجويد<br/>
                    <span className="text-xs text-gray-600">(0-20)</span>
                  </th>
                  <th className="p-3 text-center border bg-purple-200">
                    المجموع<br/>
                    <span className="text-xs text-gray-600">(60)</span>
                  </th>
                  <th className="p-3 text-right border min-w-[200px]">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const studentGrades = grades[student.id] || { quranTest: '40', tajweedTest: '20', notes: '' };
                  const total = calculateTotal(studentGrades.quranTest, studentGrades.tajweedTest);
                  
                  return (
                    <tr key={student.id} className="hover:bg-purple-50">
                      <td className="p-3 border text-center">{index + 1}</td>
                      <td className="p-3 border">{student.studentName}</td>
                      <td className="p-3 border">
                        <select
                          value={studentGrades.quranTest}
                          onChange={(e) => handleGradeChange(student.id, 'quranTest', e.target.value)}
                          className="w-full p-2 border rounded text-center focus:ring-2 focus:ring-purple-500"
                        >
                          {Array.from({ length: 161 }, (_, i) => 40 - (i * 0.25)).map(val => (
                            <option key={val} value={val.toFixed(2)}>{val.toFixed(2)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 border">
                        <select
                          value={studentGrades.tajweedTest}
                          onChange={(e) => handleGradeChange(student.id, 'tajweedTest', e.target.value)}
                          className="w-full p-2 border rounded text-center focus:ring-2 focus:ring-purple-500"
                        >
                          {Array.from({ length: 81 }, (_, i) => 20 - (i * 0.25)).map(val => (
                            <option key={val} value={val.toFixed(2)}>{val.toFixed(2)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 border text-center bg-purple-50 font-bold text-purple-800">
                        {total}
                      </td>
                      <td className="p-3 border">
                        <input
                          type="text"
                          value={studentGrades.notes}
                          onChange={(e) => handleGradeChange(student.id, 'notes', e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
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
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
            >
              {saving ? 'جاري الحفظ...' : '💾 حفظ جميع الدرجات'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-bold text-blue-800 mb-2">📋 تعليمات:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• اختبار القرآن: من 0 إلى 40 درجة (4 مقاطع × 10 درجات)</li>
          <li>• اختبار التجويد: من 0 إلى 20 درجة</li>
          <li>• المجموع النهائي: 60 درجة</li>
          <li>• يمكن استخدام ربع الدرجة (0.25)</li>
          <li>• الدرجات تُحفظ لكل طالبة في كل حلقة</li>
        </ul>
      </div>
    </>
  );
}
