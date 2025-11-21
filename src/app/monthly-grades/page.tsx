"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateQuarterStepValues } from "@/lib/grading-formulas";
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

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

function MonthlyGradesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [editedGrades, setEditedGrades] = useState<{
    [studentId: string]: {
      quranForgetfulness: number;
      quranMajorMistakes: number;
      quranMinorMistakes: number;
      tajweedTheory: number;
    };
  }>({});

  // قيم الدرجات
  const quranGradeValues = generateQuarterStepValues(5, 0.25);  // 0-5
  const tajweedGradeValues = generateQuarterStepValues(15, 0.25); // 0-15

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session]);

  useEffect(() => {
    const courseIdFromUrl = searchParams.get('courseId');
    if (courseIdFromUrl) {
      setSelectedCourse(courseIdFromUrl);
    } else if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
    }
  }, [searchParams, courses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchMonthlyGrades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  async function fetchCourses() {
    try {
      const res = await fetch('/api/attendance/teacher-courses');
      if (!res.ok) return;
      
      const data = await res.json();
      const fetchedCourses = data.courses || [];
      setCourses(fetchedCourses);

      const courseIdFromUrl = searchParams.get('courseId');
      if (!courseIdFromUrl && fetchedCourses.length > 0) {
        setSelectedCourse(fetchedCourses[0].id);
      }
    } catch (error) {
      console.error("خطأ في جلب الحلقات:", error);
    }
  }

  async function fetchMonthlyGrades() {
    if (!selectedCourse) return;
    
    try {
      const res = await fetch(`/api/grades/monthly?courseId=${selectedCourse}`);
      if (!res.ok) throw new Error("فشل في جلب البيانات");

      const data = await res.json();
      setStudents(data.students || []);
      setCourseName(data.course?.courseName || "");

      // تعبئة editedGrades بالدرجات الكاملة كافتراضي
      const initialGrades: typeof editedGrades = {};
      data.students.forEach((student: StudentGrade) => {
        const monthData = student.grades[selectedMonth];
        initialGrades[student.studentId] = {
          quranForgetfulness: monthData ? monthData.quranForgetfulness : 5,
          quranMajorMistakes: monthData ? monthData.quranMajorMistakes : 5,
          quranMinorMistakes: monthData ? monthData.quranMinorMistakes : 5,
          tajweedTheory: monthData ? monthData.tajweedTheory : 15,
        };
      });
      setEditedGrades(initialGrades);
    } catch (error) {
      console.error("خطأ في جلب الدرجات:", error);
      setMessage("❌ حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }

  function handleMonthChange(month: number) {
    setSelectedMonth(month);
    setMessage("");

    // تحديث editedGrades بقيم الشهر الجديد أو الدرجات الكاملة
    const newGrades: typeof editedGrades = {};
    students.forEach((student) => {
      const monthData = student.grades[month];
      newGrades[student.studentId] = {
        quranForgetfulness: monthData ? monthData.quranForgetfulness : 5,
        quranMajorMistakes: monthData ? monthData.quranMajorMistakes : 5,
        quranMinorMistakes: monthData ? monthData.quranMinorMistakes : 5,
        tajweedTheory: monthData ? monthData.tajweedTheory : 15,
      };
    });
    setEditedGrades(newGrades);
  }

  function handleGradeChange(
    studentId: string,
    field: keyof typeof editedGrades[string],
    value: number
  ) {
    setEditedGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  }

  async function handleSave() {
    if (!selectedCourse) return;

    setSaving(true);
    setMessage("");

    try {
      const gradesArray = Object.entries(editedGrades).map(
        ([studentId, grade]) => ({
          studentId,
          ...grade,
        })
      );

      const res = await fetch("/api/grades/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          month: selectedMonth,
          grades: gradesArray,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        await fetchMonthlyGrades();
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:mr-72">
        <AppHeader title="الدرجات الشهرية" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <BackButton />
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">📆 التقييم الشهري</h1>
            <p className="text-gray-600">الحلقة: {courseName}</p>
            <p className="text-sm text-gray-500 mb-6">
              القرآن: 15 درجة (نسيان، لحن جلي، لحن خفي) + التجويد النظري: 15 درجة = 30 درجة شهرياً × 3 أشهر = 90 درجة (الدرجات الافتراضية: كاملة)
            </p>

            {/* اختيار الحلقة والشهر */}
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
            <label className="block text-lg font-semibold text-gray-700 mb-2">الشهر:</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
            >
              {[1, 2, 3].map((month) => (
                <option key={month} value={month}>
                  الشهر {month}
                </option>
              ))}
            </select>
          </div>
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
              <thead className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold" rowSpan={2}>#</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold" rowSpan={2}>اسم الطالبة</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold" colSpan={3}>القرآن الكريم (15 درجة)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold" rowSpan={2}>التجويد النظري<br />(0 - 15)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold" rowSpan={2}>المجموع</th>
                </tr>
                <tr>
                  <th className="px-4 py-2 text-center text-xs">نسيان<br />(0 - 5)</th>
                  <th className="px-4 py-2 text-center text-xs">لحن جلي<br />(0 - 5)</th>
                  <th className="px-4 py-2 text-center text-xs">لحن خفي<br />(0 - 5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, idx) => {
                  const currentGrades = editedGrades[student.studentId] || {
                    quranForgetfulness: 5,
                    quranMajorMistakes: 5,
                    quranMinorMistakes: 5,
                    tajweedTheory: 15,
                  };
                  const total =
                    currentGrades.quranForgetfulness +
                    currentGrades.quranMajorMistakes +
                    currentGrades.quranMinorMistakes +
                    currentGrades.tajweedTheory;

                  return (
                    <tr key={student.studentId} className="hover:bg-pink-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-800">{student.studentName}</span>
                          <span className="mr-2 text-sm text-gray-500">(م{student.studentNumber})</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <select
                          value={currentGrades.quranForgetfulness}
                          onChange={(e) =>
                            handleGradeChange(student.studentId, "quranForgetfulness", Number(e.target.value))
                          }
                          className="border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        >
                          {quranGradeValues.map((val) => (
                            <option key={val} value={val}>
                              {val.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <select
                          value={currentGrades.quranMajorMistakes}
                          onChange={(e) =>
                            handleGradeChange(student.studentId, "quranMajorMistakes", Number(e.target.value))
                          }
                          className="border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        >
                          {quranGradeValues.map((val) => (
                            <option key={val} value={val}>
                              {val.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <select
                          value={currentGrades.quranMinorMistakes}
                          onChange={(e) =>
                            handleGradeChange(student.studentId, "quranMinorMistakes", Number(e.target.value))
                          }
                          className="border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        >
                          {quranGradeValues.map((val) => (
                            <option key={val} value={val}>
                              {val.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <select
                          value={currentGrades.tajweedTheory}
                          onChange={(e) =>
                            handleGradeChange(student.studentId, "tajweedTheory", Number(e.target.value))
                          }
                          className="border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        >
                          {tajweedGradeValues.map((val) => (
                            <option key={val} value={val}>
                              {val.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-lg text-gray-800">
                        {total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
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
            {saving ? "⏳ جاري الحفظ..." : `💾 حفظ درجات الشهر ${selectedMonth}`}
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-lg"
          >
            ↩️ رجوع
          </button>
        </div>

        {/* عرض جميع الأشهر */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 عرض جميع الأشهر</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 border sticky right-0 bg-gray-100 font-semibold" rowSpan={2}>الطالبة</th>
                  {[1, 2, 3].map((month) => (
                    <React.Fragment key={month}>
                      <th className="px-2 py-2 border text-center font-semibold" colSpan={5}>الشهر {month}</th>
                    </React.Fragment>
                  ))}
                  <th className="px-3 py-2 border text-center bg-pink-50 font-semibold" rowSpan={2}>الإجمالي</th>
                </tr>
                <tr>
                  {[1, 2, 3].map(() => (
                    <React.Fragment key={Math.random()}>
                      <th className="px-2 py-1 border text-center text-xs">نسيان</th>
                      <th className="px-2 py-1 border text-center text-xs">لحن ج</th>
                      <th className="px-2 py-1 border text-center text-xs">لحن خ</th>
                      <th className="px-2 py-1 border text-center text-xs">تجويد</th>
                      <th className="px-2 py-1 border text-center text-xs bg-gray-50">مج</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-pink-50">
                    <td className="px-3 py-2 border sticky right-0 bg-white font-medium">
                      {student.studentName}
                    </td>
                    {[1, 2, 3].map((month) => {
                      const monthData = student.grades[month] || {
                        quranForgetfulness: 5,
                        quranMajorMistakes: 5,
                        quranMinorMistakes: 5,
                        tajweedTheory: 15,
                        total: 30,
                      };
                      return (
                        <React.Fragment key={month}>
                          <td className="px-2 py-2 border text-center">{monthData.quranForgetfulness.toFixed(2)}</td>
                          <td className="px-2 py-2 border text-center">{monthData.quranMajorMistakes.toFixed(2)}</td>
                          <td className="px-2 py-2 border text-center">{monthData.quranMinorMistakes.toFixed(2)}</td>
                          <td className="px-2 py-2 border text-center">{monthData.tajweedTheory.toFixed(2)}</td>
                          <td className="px-2 py-2 border text-center font-semibold bg-gray-50">{monthData.total.toFixed(2)}</td>
                        </React.Fragment>
                      );
                    })}
                    <td className="px-3 py-2 border text-center font-bold bg-pink-50">
                      {student.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}export default function MonthlyGradesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="text-xl">جاري التحميل...</div></div>}>
      <MonthlyGradesContent />
    </Suspense>
  );
}
