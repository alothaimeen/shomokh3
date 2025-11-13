'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
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

function DailyGradesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

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

  useEffect(() => {
    if (!courseId) {
      setMessage('⚠️ يجب اختيار الحلقة أولاً من /teacher');
      return;
    }

    fetchStudents();
    fetchExistingGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, selectedDate]);

  const fetchStudents = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/enrollment/enrolled-students?courseId=${courseId}`
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
    if (!courseId || !selectedDate) return;

    try {
      // تحويل التاريخ إلى بداية اليوم ونهايته (UTC)
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/grades/daily?courseId=${courseId}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
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
    if (!courseId) {
      setMessage('⚠️ courseId مفقود');
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
          courseId,
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

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">التقييم اليومي</h1>
          <p className="text-lg text-amber-600 mb-6">⚠️ يجب اختيار الحلقة أولاً</p>
          <button
            onClick={() => router.push('/teacher')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            اختر الحلقة من صفحة المعلمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 التقييم اليومي</h1>
          <p className="text-gray-600">إدخال درجات التقييم اليومي للطالبات (حفظ وتجويد + مراجعة وتجويد)</p>
        </div>

        {/* اختيار التاريخ */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">تاريخ التقييم:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
          />
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
  );
}

export default function DailyGradesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">جاري التحميل...</div></div>}>
      <DailyGradesContent />
    </Suspense>
  );
}
