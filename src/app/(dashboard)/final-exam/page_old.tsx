'use client';

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

function FinalExamContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<{ [key: string]: { quranTest: string; tajweedTest: string; notes: string } }>({});
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
    if (courseId) {
      setSelectedCourse(courseId);
    } else if (courses.length > 0 && !selectedCourse) {
      // اختيار أول حلقة تلقائياً
      setSelectedCourse(courses[0].id);
    }
  }, [searchParams, courses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchGrades();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/teacher-courses');
      const data = await response.json();
      
      if (data.courses && data.courses.length > 0) {
        setCourses(data.courses);
        
        // إذا لم يكن هناك courseId في URL، اختر أول حلقة
        const courseIdFromUrl = searchParams.get('courseId');
        if (!courseIdFromUrl) {
          setSelectedCourse(data.courses[0].id);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الحلقات:', error);
    }
  };

  const fetchGrades = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/grades/final-exam?courseId=${selectedCourse}`);
      const data = await response.json();
      
      if (data.students) {
        setStudents(data.students);
        
        // تحويل الدرجات المحفوظة إلى object (الدرجة الافتراضية هي الكاملة)
        const gradesMap: any = {};
        data.students.forEach((student: any) => {
          gradesMap[student.id] = {
            quranTest: student.finalExam?.quranTest?.toString() || '40',
            tajweedTest: student.finalExam?.tajweedTest?.toString() || '20',
            notes: student.finalExam?.notes || ''
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

  const handleGradeChange = (studentId: string, field: 'quranTest' | 'tajweedTest' | 'notes', value: string) => {
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

    // التحقق من الدرجات
    const gradesArray = Object.entries(grades).map(([studentId, grade]) => ({
      studentId,
      quranTest: parseFloat(grade.quranTest) || 0,
      tajweedTest: parseFloat(grade.tajweedTest) || 0,
      notes: grade.notes || ''
    }));

    // التحقق من صحة الدرجات
    for (const grade of gradesArray) {
      if (grade.quranTest < 0 || grade.quranTest > 40) {
        alert('درجة القرآن يجب أن تكون بين 0 و 40');
        return;
      }
      if (grade.tajweedTest < 0 || grade.tajweedTest > 20) {
        alert('درجة التجويد يجب أن تكون بين 0 و 20');
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch('/api/grades/final-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          grades: gradesArray
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ تم حفظ الدرجات بنجاح');
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

  const calculateTotal = (quranTest: string, tajweedTest: string) => {
    const quran = parseFloat(quranTest) || 0;
    const tajweed = parseFloat(tajweedTest) || 0;
    return (quran + tajweed).toFixed(2);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    return null;
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:mr-72">
        <AppHeader title="الاختبار النهائي" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <BackButton />
            
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">🎓 الاختبار النهائي</h1>
              <p className="text-gray-600">إدخال درجات الاختبار النهائي (60 درجة)</p>
            </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختيار الحلقة
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- اختر حلقة --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.programName} - {course.courseName} ({course.courseLevel})
              </option>
            ))}
          </select>
        </div>

        {/* Grades Table */}
        {selectedCourse && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-800">
                {selectedCourseData?.courseName}
              </h2>
              <div className="text-sm text-gray-600">
                إجمالي: 60 درجة (القرآن 40 + التجويد 20)
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
                      const studentGrades = grades[student.id] || { quranTest: '', tajweedTest: '', notes: '' };
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

            {/* رسالة النجاح أو الخطأ */}
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
        )}

            {/* Instructions */}
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default function FinalExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    }>
      <FinalExamContent />
    </Suspense>
  );
}
