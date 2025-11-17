import React, { useState, useEffect, memo } from 'react';
import { generateQuarterStepValues } from '@/lib/grading-formulas';

interface DailyGradesTabProps {
  courseId: string;
  date: string;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

interface StudentCardData {
  id: string;
  studentName: string;
  studentEmail: string;
  studentNumber: number;
  // Attendance
  attendanceStatus: string;
  // Grades (2 fields + behavior)
  memorization: number;
  review: number;
  behaviorScore: number;
  // Tasks (read-only)
  listening5Times: boolean;
  repetition10Times: boolean;
  recitedToPeer: boolean;
  // Points (4 checkboxes)
  earlyAttendance: boolean;
  perfectMemorization: boolean;
  activeParticipation: boolean;
  timeCommitment: boolean;
}

export const DailyGradesTab = memo(({ courseId, date, onUnsavedChanges }: DailyGradesTabProps) => {
  const [studentsData, setStudentsData] = useState<StudentCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, { grades: boolean; tasks: boolean; points: boolean }>>({});

  const gradeValues = generateQuarterStepValues(5, 0.25);
  const behaviorValues = generateQuarterStepValues(1, 0.25);

  useEffect(() => {
    if (courseId && date) {
      fetchAllData();
    }
  }, [courseId, date]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Get students
      const studentsRes = await fetch(`/api/enrollment/enrolled-students?courseId=${courseId}`);
      const studentsData = await studentsRes.json();
      
      if (!studentsRes.ok) {
        throw new Error('فشل جلب الطالبات');
      }

      const students = (studentsData.enrollments || []).map((enrollment: any) => ({
        id: enrollment.student.id,
        studentName: enrollment.student.studentName,
        studentEmail: enrollment.student.userEmail,
        studentNumber: enrollment.student.studentNumber,
      }));

      // 2. Fetch all data in parallel (including attendance)
      const [dailyGradesRes, behaviorRes, pointsRes, tasksRes, attendanceRes] = await Promise.all([
        fetch(`/api/grades/daily?courseId=${courseId}&startDate=${new Date(date).toISOString()}&endDate=${new Date(date).toISOString()}`),
        fetch(`/api/grades/behavior?courseId=${courseId}&date=${date}`),
        fetch(`/api/points/behavior?courseId=${courseId}&date=${date}`),
        fetch(`/api/points/daily-tasks?courseId=${courseId}&date=${date}`),
        fetch(`/api/attendance/course-attendance?courseId=${courseId}&date=${date}`)
      ]);

      const dailyGrades = await dailyGradesRes.json();
      const behavior = await behaviorRes.json();
      const points = await pointsRes.json();
      const tasks = await tasksRes.json();
      const attendance = await attendanceRes.json();

      // 3. Merge all data
      const mergedData: StudentCardData[] = students.map((student: any) => {
        const dailyGrade = dailyGrades.dailyGrades?.find((g: any) => g.studentId === student.id);
        const behaviorGrade = behavior.students?.find((s: any) => s.id === student.id)?.behaviorGrade;
        const studentPoints = points.students?.find((s: any) => s.studentId === student.id);
        const studentTasks = tasks.tasks?.find((t: any) => t.studentId === student.id);
        const studentAttendance = attendance.attendances?.find((a: any) => a.studentId === student.id);

        return {
          id: student.id,
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          studentNumber: student.studentNumber,
          // Attendance
          attendanceStatus: studentAttendance?.status || 'PRESENT',
          // Keep original 2 fields
          memorization: dailyGrade ? Number(dailyGrade.memorization) : 0,
          review: dailyGrade ? Number(dailyGrade.review) : 0,
          behaviorScore: behaviorGrade?.dailyScore || 0,
          listening5Times: studentTasks?.listening5Times || false,
          repetition10Times: studentTasks?.repetition10Times || false,
          recitedToPeer: studentTasks?.recitedToPeer || false,
          earlyAttendance: studentPoints?.earlyAttendance || false,
          perfectMemorization: studentPoints?.perfectMemorization || false,
          activeParticipation: studentPoints?.activeParticipation || false,
          timeCommitment: studentPoints?.timeCommitment || false,
        };
      });

      setStudentsData(mergedData);
      
      // Initialize all sections as expanded
      const expanded: Record<string, any> = {};
      mergedData.forEach(s => {
        expanded[s.id] = { grades: true, tasks: true, points: true };
      });
      setExpandedSections(expanded);

    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      setMessage('❌ حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (studentId: string, section: 'grades' | 'tasks' | 'points') => {
    setExpandedSections(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [section]: !prev[studentId]?.[section]
      }
    }));
  };

  const handleGradeChange = (studentId: string, field: keyof StudentCardData, value: number) => {
    setStudentsData(prev => prev.map(s => 
      s.id === studentId ? { ...s, [field]: value } : s
    ));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handlePointChange = (studentId: string, field: keyof StudentCardData) => {
    setStudentsData(prev => prev.map(s => 
      s.id === studentId ? { ...s, [field]: !s[field] } : s
    ));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setStudentsData(prev => prev.map(s => 
      s.id === studentId ? { ...s, attendanceStatus: status } : s
    ));
    onUnsavedChanges(true);
    setMessage('');
  };

  const calculateTotals = (student: StudentCardData) => {
    const gradesTotal = Number(student.memorization) + Number(student.review) + Number(student.behaviorScore);
    const tasksTotal = (student.listening5Times ? 5 : 0) + 
                      (student.repetition10Times ? 5 : 0) + 
                      (student.recitedToPeer ? 5 : 0);
    const pointsTotal = (student.earlyAttendance ? 5 : 0) + 
                       (student.perfectMemorization ? 5 : 0) + 
                       (student.activeParticipation ? 5 : 0) + 
                       (student.timeCommitment ? 5 : 0);
    return { gradesTotal, tasksTotal, pointsTotal, grandTotal: gradesTotal + tasksTotal + pointsTotal };
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');

    try {
      const dateToSave = new Date(date);
      dateToSave.setHours(12, 0, 0, 0);

      // Save daily grades
      const dailyGradesArray = studentsData.map(s => ({
        studentId: s.id,
        memorization: s.memorization,
        review: s.review,
        notes: ''
      }));

      const dailyRes = await fetch('/api/grades/daily/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, date: dateToSave.toISOString(), grades: dailyGradesArray })
      });

      // Save behavior grades
      const behaviorArray = studentsData.map(s => ({
        studentId: s.id,
        dailyScore: s.behaviorScore,
        notes: ''
      }));

      const behaviorRes = await fetch('/api/grades/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, date, grades: behaviorArray })
      });

      // Save behavior points
      const pointsArray = studentsData.map(s => ({
        studentId: s.id,
        earlyAttendance: s.earlyAttendance,
        perfectMemorization: s.perfectMemorization,
        activeParticipation: s.activeParticipation,
        timeCommitment: s.timeCommitment,
        notes: ''
      }));

      const pointsRes = await fetch('/api/points/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, date, points: pointsArray })
      });

      // Save attendance for all students
      const attendancePromises = studentsData.map(s =>
        fetch('/api/attendance/mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: s.id,
            courseId,
            status: s.attendanceStatus,
            date: dateToSave.toISOString()
          })
        })
      );

      const attendanceResults = await Promise.all(attendancePromises);
      const allAttendanceOk = attendanceResults.every(r => r.ok);

      if (dailyRes.ok && behaviorRes.ok && pointsRes.ok && allAttendanceOk) {
        setMessage('✅ تم حفظ جميع البيانات بنجاح');
        onUnsavedChanges(false);
      } else {
        setMessage('❌ حدث خطأ في حفظ بعض البيانات');
      }
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      setMessage('❌ حدث خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        التقييم اليومي الشامل - {new Date(date).toLocaleDateString('ar-EG')}
      </h3>

      {message && (
        <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentsData.map(student => {
          const totals = calculateTotals(student);
          const isExpanded = expandedSections[student.id] || { grades: true, tasks: true, points: true };

          return (
            <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold">👧 {student.studentName}</h4>
                    <p className="text-sm opacity-90">{student.studentEmail}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{totals.grandTotal.toFixed(2)}</div>
                    <div className="text-xs">المجموع</div>
                  </div>
                </div>
              </div>

              {/* Attendance Section */}
              <div className="p-4 bg-indigo-50 border-b border-gray-200">
                <label className="text-xs text-gray-700 font-semibold block mb-2">📋 الحضور</label>
                <select
                  value={student.attendanceStatus}
                  onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PRESENT">حاضرة</option>
                  <option value="EXCUSED">معتذرة (غائبة بعذر)</option>
                  <option value="ABSENT">غائبة بدون عذر</option>
                  <option value="REVIEWED">راجعت بدون حضور</option>
                  <option value="LEFT_EARLY">خروج مبكر</option>
                </select>
              </div>

              {/* Section 1: Grades */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection(student.id, 'grades')}
                  className="w-full p-3 bg-white hover:bg-gray-50 flex justify-between items-center text-right"
                >
                  <span className="font-semibold text-gray-700">📚 الدرجات ({totals.gradesTotal.toFixed(2)} درجة)</span>
                  <span>{isExpanded.grades ? '⏬' : '⏫'}</span>
                </button>
                {isExpanded.grades && (
                  <div className="p-4 bg-white space-y-3">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">حفظ وتجويد (0-5)</label>
                        <select
                          value={student.memorization}
                          onChange={(e) => handleGradeChange(student.id, 'memorization', Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border rounded"
                        >
                          {gradeValues.map(v => <option key={v} value={v}>{v.toFixed(2)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">مراجعة وتجويد (0-5)</label>
                        <select
                          value={student.review}
                          onChange={(e) => handleGradeChange(student.id, 'review', Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border rounded"
                        >
                          {gradeValues.map(v => <option key={v} value={v}>{v.toFixed(2)}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">درجة السلوك (0-1)</label>
                      <select
                        value={student.behaviorScore}
                        onChange={(e) => handleGradeChange(student.id, 'behaviorScore', Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm border rounded"
                      >
                        {behaviorValues.map(v => <option key={v} value={v}>{v.toFixed(2)}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Tasks (Read-only) */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection(student.id, 'tasks')}
                  className="w-full p-3 bg-green-50 hover:bg-green-100 flex justify-between items-center text-right"
                >
                  <span className="font-semibold text-gray-700">🎯 المهام ({totals.tasksTotal} نقطة)</span>
                  <span>{isExpanded.tasks ? '⏬' : '⏫'}</span>
                </button>
                {isExpanded.tasks && (
                  <div className="p-4 bg-green-50 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={student.listening5Times} disabled className="w-4 h-4" />
                      <span className="text-sm">🔊 سماع 5× ({student.listening5Times ? 5 : 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={student.repetition10Times} disabled className="w-4 h-4" />
                      <span className="text-sm">🔄 تكرار 10× ({student.repetition10Times ? 5 : 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={student.recitedToPeer} disabled className="w-4 h-4" />
                      <span className="text-sm">👥 سرد ({student.recitedToPeer ? 5 : 0})</span>
                    </div>
                    <p className="text-xs text-gray-600 italic mt-2">(الطالبة أدخلت هذه المهام)</p>
                  </div>
                )}
              </div>

              {/* Section 3: Points */}
              <div>
                <button
                  onClick={() => toggleSection(student.id, 'points')}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 flex justify-between items-center text-right"
                >
                  <span className="font-semibold text-gray-700">🏆 النقاط ({totals.pointsTotal} نقطة)</span>
                  <span>{isExpanded.points ? '⏬' : '⏫'}</span>
                </button>
                {isExpanded.points && (
                  <div className="p-4 bg-blue-50 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={student.earlyAttendance}
                        onChange={() => handlePointChange(student.id, 'earlyAttendance')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">⏰ مبكر (5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={student.perfectMemorization}
                        onChange={() => handlePointChange(student.id, 'perfectMemorization')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">✅ متقن (5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={student.activeParticipation}
                        onChange={() => handlePointChange(student.id, 'activeParticipation')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">🙋 مشاركة (5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={student.timeCommitment}
                        onChange={() => handlePointChange(student.id, 'timeCommitment')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">⌚ التزام (5)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex justify-between border-t">
                <span>درجات: {totals.gradesTotal.toFixed(2)}</span>
                <span>مهام: {totals.tasksTotal}</span>
                <span>نقاط: {totals.pointsTotal}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSaveAll}
          disabled={saving || studentsData.length === 0}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ جميع البيانات'}
        </button>
      </div>
    </div>
  );
});

DailyGradesTab.displayName = 'DailyGradesTab';
