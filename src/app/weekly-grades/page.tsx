"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { generateQuarterStepValues } from "@/lib/grading-formulas";

interface StudentGrade {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentNumber: number;
  grades: { [week: number]: number };
  total: number;
}

function WeeklyGradesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [editedGrades, setEditedGrades] = useState<{
    [studentId: string]: number;
  }>({});
  const [message, setMessage] = useState("");

  // قيم الدرجات (5، 4.75، 4.5، ... 0)
  const gradeValues = generateQuarterStepValues(5, 0.25);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && courseId) {
      fetchWeeklyGrades();
    }
  }, [session, courseId]);

  async function fetchWeeklyGrades() {
    try {
      const res = await fetch(`/api/grades/weekly?courseId=${courseId}`);
      if (!res.ok) throw new Error("فشل في جلب البيانات");

      const data = await res.json();
      setStudents(data.students || []);
      setCourseName(data.course?.courseName || "");

      // تعبئة editedGrades بالدرجة الكاملة (5) كافتراضي
      const initialGrades: { [studentId: string]: number } = {};
      data.students.forEach((student: StudentGrade) => {
        initialGrades[student.studentId] = student.grades[selectedWeek] !== undefined 
          ? student.grades[selectedWeek] 
          : 5; // الدرجة الافتراضية هي الكاملة
      });
      setEditedGrades(initialGrades);
    } catch (error) {
      console.error("خطأ في جلب الدرجات:", error);
      setMessage("❌ حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }

  function handleWeekChange(week: number) {
    setSelectedWeek(week);
    setMessage(""); // مسح الرسالة عند تغيير الأسبوع
    
    // تحديث editedGrades بقيم الأسبوع الجديد أو الدرجة الكاملة
    const newGrades: { [studentId: string]: number } = {};
    students.forEach((student) => {
      newGrades[student.studentId] = student.grades[week] !== undefined 
        ? student.grades[week] 
        : 5; // الدرجة الافتراضية هي الكاملة
    });
    setEditedGrades(newGrades);
  }

  function handleGradeChange(studentId: string, value: number) {
    setEditedGrades((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  }

  async function handleSave() {
    if (!courseId) return;

    setSaving(true);
    setMessage("");
    
    try {
      const gradesArray = Object.entries(editedGrades).map(
        ([studentId, grade]) => ({
          studentId,
          grade,
        })
      );

      const res = await fetch("/api/grades/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          week: selectedWeek,
          grades: gradesArray,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        await fetchWeeklyGrades(); // إعادة تحميل البيانات
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("خطأ في حفظ الدرجات:", error);
      setMessage("❌ حدث خطأ في حفظ البيانات");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!session) return null;

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "TEACHER"
  ) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-red-600">غير مصرح لك بالوصول</h1>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-red-600">معرف الحلقة مفقود</h1>
        <button
          onClick={() => router.push("/teacher")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          العودة للحلقات
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 التقييم الأسبوعي</h1>
          <p className="text-gray-600">الحلقة: {courseName}</p>
          <p className="text-sm text-gray-500 mt-1">
            كل أسبوع: 5 درجات × 10 أسابيع = 50 درجة (الدرجة الافتراضية: 5)
          </p>
        </div>

        {/* اختيار الأسبوع */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2">اختر الأسبوع:</label>
          <select
            value={selectedWeek}
            onChange={(e) => handleWeekChange(Number(e.target.value))}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((week) => (
              <option key={week} value={week}>
                الأسبوع {week}
              </option>
            ))}
          </select>
        </div>

        {/* رسالة النجاح/الخطأ */}
        {message && (
          <div className={`rounded-lg p-4 mb-6 ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
              : 'bg-red-100 text-red-800 border-2 border-red-300'
          }`}>
            <p className="text-lg font-semibold">{message}</p>
          </div>
        )}

        {/* جدول الدرجات */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold">#</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">اسم الطالبة</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">الدرجة (0 - 5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-800">{student.studentName}</span>
                        <span className="mr-2 text-sm text-gray-500">(م{student.studentNumber})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={editedGrades[student.studentId] || 5}
                        onChange={(e) =>
                          handleGradeChange(student.studentId, Number(e.target.value))
                        }
                        className="border-2 border-gray-300 rounded-lg px-4 py-2 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      >
                        {gradeValues.map((val) => (
                          <option key={val} value={val}>
                            {val.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg"
          >
            {saving ? "⏳ جاري الحفظ..." : `💾 حفظ درجات الأسبوع ${selectedWeek}`}
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-lg"
          >
            ↩️ رجوع
          </button>
        </div>

        {/* عرض جميع الأسابيع (للمراجعة) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 عرض جميع الأسابيع</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border sticky right-0 bg-gray-100 font-semibold">
                    الطالبة
                  </th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((week) => (
                    <th key={week} className="px-3 py-2 border text-center font-semibold">
                      أ{week}
                    </th>
                  ))}
                  <th className="px-3 py-2 border text-center bg-indigo-50 font-semibold">
                    المجموع
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-indigo-50">
                    <td className="px-3 py-2 border sticky right-0 bg-white font-medium">
                      {student.studentName}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((week) => (
                      <td
                        key={week}
                        className="px-3 py-2 border text-center"
                      >
                        {student.grades[week]?.toFixed(2) || "5.00"}
                      </td>
                    ))}
                    <td className="px-3 py-2 border text-center font-bold bg-indigo-50">
                      {student.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WeeklyGradesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="text-xl">جاري التحميل...</div></div>}>
      <WeeklyGradesContent />
    </Suspense>
  );
}
