'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { generateQuarterStepValues } from '@/lib/grading-formulas';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

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

interface Course {
  id: string;
  courseName: string;
  level: number;
  program: {
    id: string;
    programName: string;
  };
  _count: {
    enrollments: number;
  };
}

function DailyGradesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // قيم الدرجات (10، 9.75، 9.5، ... 0)
  const gradeValues = generateQuarterStepValues(5, 0.25);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // جلب الحلقات
  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session]);

  // التعامل مع courseId من URL
  useEffect(() => {
    const courseIdFromUrl = searchParams.get('courseId');
    if (courseIdFromUrl) {
      setSelectedCourse(courseIdFromUrl);
    } else if (courses.length > 0 && !selectedCourse) {
      // اختيار أول حلقة تلقائياً
      setSelectedCourse(courses[0].id);
    }
  }, [searchParams, courses]);

  // جلب البيانات عند تغيير الحلقة أو التاريخ
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchStudents();
      fetchExistingGrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/attendance/teacher-courses');
      if (!response.ok) return;

      const data = await response.json();
      const fetchedCourses = data.courses || [];
      setCourses(fetchedCourses);

      // اختيار أول حلقة تلقائياً إذا لم يكن هناك courseId في URL
      const courseIdFromUrl = searchParams.get('courseId');
      if (!courseIdFromUrl && fetchedCourses.length > 0) {
        setSelectedCourse(fetchedCourses[0].id);
      }
    } catch (error) {
      console.error('خطأ في جلب الحلقات:', error);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCourse) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/enrollment/enrolled-students?courseId=${selectedCourse}`
      );
      const data = await res.json();

      if (res.ok) {
        // تحويل enrollments إلى students بسيطة
        const studentsList = (data.enrollments || []).map((enrollment: any) => ({
          id: enrollment.student.id,
          studentName: enrollment.student.studentName,
          studentNumber: enrollment.student.studentNumber,
        }));
        setStudents(studentsList);
      } else {
        setMessage(data.error || 'فشل جلب الطالبات');
      }
    } catch (error) {
      console.error('خطأ في جلب الطالبات:', error);
      setMessage('فشل جلب الطالبات');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingGrades = async () => {
    if (!selectedCourse || !selectedDate) return;

    try {
      // تحويل التاريخ إلى بداية اليوم ونهايته (UTC)
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/grades/daily?courseId=${selectedCourse}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      );
      const data = await res.json();

      if (res.ok && data.dailyGrades) {
        const existingGrades: Record<string, GradeEntry> = {};
        data.dailyGrades.forEach((g: any) => {
          existingGrades[g.studentId] = {
            studentId: g.studentId,
            memorization: Number(g.memorization),
            review: Number(g.review),
            notes: g.notes || '',
          };
        });
        // دمج مع الدرجات الحالية (الحفاظ على التعديلات غير المحفوظة)
        setGrades((prev) => ({
          ...existingGrades,
          ...prev, // التعديلات الحالية لها الأولوية
        }));
      }
    } catch (error) {
      console.error('خطأ في جلب الدرجات الموجودة:', error);
    }
  };

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

  const handleSaveAll = async () => {
    if (!selectedCourse) {
      setMessage('⚠️ يجب اختيار الحلقة');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      // تحويل التاريخ المحدد إلى ISO string مع بداية اليوم
      const dateToSave = new Date(selectedDate);
      dateToSave.setHours(12, 0, 0, 0); // منتصف النهار لتجنب مشاكل المناطق الزمنية
      
      // إرسال فقط الدرجات التي تم تغييرها (ليس القيم الافتراضية)
      const gradesToSave = Object.values(grades)
        .filter((g) => {
          const mem = Number(g.memorization);
          const rev = Number(g.review);
          return mem > 0 || rev > 0;
        })
        .map((g) => ({
          studentId: g.studentId,
          memorization: Number(g.memorization),
          review: Number(g.review),
          notes: g.notes || '',
          date: dateToSave.toISOString(),
        }));

      if (gradesToSave.length === 0) {
        setMessage('⚠️ لا توجد درجات لحفظها (جميع القيم = 0)');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/grades/daily/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          grades: gradesToSave,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // انتظار قليل ثم إعادة جلب للتأكيد
        setTimeout(() => fetchExistingGrades(), 500);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      setMessage('❌ فشل حفظ الدرجات');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">غير مصرح لك بالوصول لهذه الصفحة</div>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="الدرجات اليومية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">📊 التقييم اليومي</h1>
          <p className="text-gray-600 mb-6">إدخال درجات التقييم اليومي للطالبات (حفظ وتجويد + مراجعة وتجويد)</p>

        {/* اختيار الحلقة والتاريخ */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">الحلقة:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              {courses.length === 0 && <option value="">جاري التحميل...</option>}
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName} ({course._count.enrollments} طالبة)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">تاريخ التقييم:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
            />
          </div>
        </div>

        {/* رسالة الحالة */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* جدول الدرجات */}
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
                          id={`memorization-${student.id}`}
                          name={`memorization-${student.id}`}
                          value={studentGrade.memorization}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            console.log('✏️ Memorization تغيير:', { raw: e.target.value, parsed: val });
                            handleGradeChange(student.id, 'memorization', val);
                          }}
                          className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-purple-500 focus:outline-none"
                          aria-label={`حفظ وتجويد - ${student.studentName}`}
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
                          id={`review-${student.id}`}
                          name={`review-${student.id}`}
                          value={studentGrade.review}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            console.log('✏️ Review تغيير:', { raw: e.target.value, parsed: val });
                            handleGradeChange(student.id, 'review', val);
                          }}
                          className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none"
                          aria-label={`مراجعة وتجويد - ${student.studentName}`}
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

        {/* زر الحفظ */}
        {students.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className={`px-8 py-4 rounded-lg text-xl font-bold text-white transition-all ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg'
              }`}
            >
              {saving ? '⏳ جاري الحفظ...' : '💾 حفظ جميع الدرجات'}
            </button>
          </div>
        )}

        {/* ملاحظة */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            💡 الدرجة اليومية الكاملة: 10 درجات (5 حفظ + 5 مراجعة) | المجموع الخام على 70 يوم: 700 درجة
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyGradesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">جاري التحميل...</div></div>}>
      <DailyGradesContent />
    </Suspense>
  );
}
