'use client';

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function BehaviorGradesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<{ [key: string]: { dailyScore: string; notes: string } }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') {
      fetchCourses();
    }
  }, [session]);

  useEffect(() => {
    const courseId = searchParams.get('courseId');
    if (courseId && courses.length > 0) {
      setSelectedCourse(courseId);
    }
  }, [searchParams, courses]);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchGrades();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/programs');
      const data = await response.json();
      
      if (data.programs) {
        const allCourses = data.programs.flatMap((program: any) => 
          program.courses.map((course: any) => ({
            ...course,
            programName: program.programName
          }))
        );
        setCourses(allCourses);
      }
    } catch (error) {
      console.error('خطأ في جلب الحلقات:', error);
    }
  };

  const fetchGrades = async () => {
    if (!selectedCourse || !selectedDate) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/grades/behavior?courseId=${selectedCourse}&date=${selectedDate}`);
      const data = await response.json();
      
      if (data.students) {
        setStudents(data.students);
        
        // تحويل الدرجات المحفوظة إلى object (الدرجة الافتراضية هي 1 - ممتاز)
        const gradesMap: any = {};
        data.students.forEach((student: any) => {
          gradesMap[student.id] = {
            dailyScore: student.behaviorGrade?.dailyScore?.toString() || '1',
            notes: student.behaviorGrade?.notes || ''
          };
        });
        setGrades(gradesMap);
      }
    } catch (error) {
      console.error('خطأ في جلب الدرجات:', error);
      alert('حدث خطأ في جلب الدرجات');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, field: 'dailyScore' | 'notes', value: string) => {
    setMessage(''); // إخفاء الرسالة عند التعديل
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      alert('الرجاء اختيار حلقة أولاً');
      return;
    }

    if (!selectedDate) {
      alert('الرجاء اختيار التاريخ');
      return;
    }

    // التحقق من الدرجات
    const gradesArray = Object.entries(grades).map(([studentId, grade]) => ({
      studentId,
      dailyScore: parseFloat(grade.dailyScore) || 0,
      notes: grade.notes || ''
    }));

    // التحقق من صحة الدرجات
    for (const grade of gradesArray) {
      if (grade.dailyScore < 0 || grade.dailyScore > 1) {
        alert('درجة السلوك يجب أن تكون بين 0 و 1');
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch('/api/grades/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate,
          grades: gradesArray
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ تم حفظ درجات السلوك بنجاح');
        fetchGrades(); // إعادة جلب البيانات
      } else {
        setMessage('❌ ' + (data.error || 'حدث خطأ في حفظ الدرجات'));
      }
    } catch (error) {
      console.error('خطأ في حفظ الدرجات:', error);
      setMessage('❌ حدث خطأ في حفظ الدرجات');
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    return null;
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">⭐ السلوك والمواظبة</h1>
          <p className="text-gray-600">إدخال درجات السلوك اليومية (70 درجة خام = 70 يوم)</p>
        </div>

        {/* Course and Date Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختيار الحلقة
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">-- اختر حلقة --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.programName} - {course.courseName} ({course.courseLevel})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grades Table */}
        {selectedCourse && selectedDate && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-800">
                {selectedCourseData?.courseName} - {new Date(selectedDate).toLocaleDateString('ar-SA')}
              </h2>
              <div className="text-sm text-gray-600">
                درجة يومية: 0-1
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">جاري تحميل الطالبات...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد طالبات مسجلات في هذه الحلقة
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-right border">#</th>
                      <th className="p-3 text-right border min-w-[200px]">اسم الطالبة</th>
                      <th className="p-3 text-center border">
                        درجة السلوك<br/>
                        <span className="text-xs text-gray-600">(0-1)</span>
                      </th>
                      <th className="p-3 text-right border min-w-[300px]">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const studentGrades = grades[student.id] || { dailyScore: '', notes: '' };
                      
                      return (
                        <tr key={student.id} className="hover:bg-green-50">
                          <td className="p-3 border text-center">{index + 1}</td>
                          <td className="p-3 border">{student.studentName}</td>
                          <td className="p-3 border">
                            <select
                              value={studentGrades.dailyScore}
                              onChange={(e) => handleGradeChange(student.id, 'dailyScore', e.target.value)}
                              className="w-full p-2 border rounded text-center focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">-- اختر --</option>
                              <option value="1">1 - ممتاز</option>
                              <option value="0.75">0.75 - جيد جداً</option>
                              <option value="0.5">0.5 - جيد</option>
                              <option value="0.25">0.25 - مقبول</option>
                              <option value="0">0 - ضعيف</option>
                            </select>
                          </td>
                          <td className="p-3 border">
                            <input
                              type="text"
                              value={studentGrades.notes}
                              onChange={(e) => handleGradeChange(student.id, 'notes', e.target.value)}
                              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
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

            {students.length > 0 && (
              <>
                {/* رسالة النجاح/الخطأ */}
                {message && (
                  <div className={`mt-4 p-4 rounded-lg ${message.includes('خطأ') || message.includes('فشل') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                    {message}
                  </div>
                )}

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
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                  >
                    {saving ? 'جاري الحفظ...' : '💾 حفظ درجات السلوك'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-bold text-blue-800 mb-2">📋 تعليمات:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• درجة السلوك اليومية: من 0 إلى 1</li>
            <li>• يتم تسجيل الدرجة لكل يوم على مدار 70 يوماً</li>
            <li>• المجموع النهائي: 70 درجة خام (سيتم قسمتها على 7 = 10 درجات نهائية)</li>
            <li>• يمكن اختيار الدرجة من القائمة أو إدخالها يدوياً</li>
            <li>• الدرجات تُحفظ لكل طالبة في كل حلقة في كل يوم</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function BehaviorGradesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    }>
      <BehaviorGradesContent />
    </Suspense>
  );
}
