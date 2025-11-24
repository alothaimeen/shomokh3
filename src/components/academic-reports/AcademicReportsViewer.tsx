'use client';

import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  courseName: string;
  programName: string;
}

interface StudentGrades {
  dailyRaw: number;
  weeklyRaw: number;
  monthlyRaw: number;
  behaviorRaw: number;
  finalExamRaw: number;
  daily: number;
  weekly: number;
  monthly: number;
  behavior: number;
  finalExam: number;
  total: number;
  percentage: number;
}

interface StudentReport {
  studentId: number;
  studentName: string;
  grades: StudentGrades;
}

interface Props {
  courses: Course[];
  reports: StudentReport[];
  selectedCourseId: string;
}

export default function AcademicReportsViewer({ courses, reports, selectedCourseId }: Props) {
  const router = useRouter();

  const handleCourseChange = (courseId: string) => {
    router.push(`/academic-reports?courseId=${courseId}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الحلقة
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName} - {course.programName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-600">
          لا توجد طالبات مسجلات في هذه الحلقة
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p><strong>ملاحظة:</strong> الحسابات التالية:</p>
            <ul className="list-disc list-inside mt-2">
              <li>الدرجات اليومية: 20% من المجموع النهائي</li>
              <li>الدرجات الأسبوعية: 20% من المجموع النهائي</li>
              <li>الدرجات الشهرية: 20% من المجموع النهائي</li>
              <li>درجات السلوك: 10% من المجموع النهائي</li>
              <li>الاختبار النهائي: 30% من المجموع النهائي</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-purple to-primary-blue text-white">
                <tr>
                  <th className="p-3 text-right">الرقم</th>
                  <th className="p-3 text-right">اسم الطالبة</th>
                  <th className="p-3 text-center">يومي (خام)</th>
                  <th className="p-3 text-center">أسبوعي (خام)</th>
                  <th className="p-3 text-center">شهري (خام)</th>
                  <th className="p-3 text-center">سلوك (خام)</th>
                  <th className="p-3 text-center">نهائي (خام)</th>
                  <th className="p-3 text-center">يومي (20%)</th>
                  <th className="p-3 text-center">أسبوعي (20%)</th>
                  <th className="p-3 text-center">شهري (20%)</th>
                  <th className="p-3 text-center">سلوك (10%)</th>
                  <th className="p-3 text-center">نهائي (30%)</th>
                  <th className="p-3 text-center bg-yellow-500">المجموع</th>
                  <th className="p-3 text-center bg-green-600">النسبة%</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.studentId} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-right font-medium">{report.studentId}</td>
                    <td className="p-3 text-right font-medium">{report.studentName}</td>
                    <td className="p-3 text-center text-gray-600">{report.grades.dailyRaw}</td>
                    <td className="p-3 text-center text-gray-600">{report.grades.weeklyRaw}</td>
                    <td className="p-3 text-center text-gray-600">{report.grades.monthlyRaw}</td>
                    <td className="p-3 text-center text-gray-600">{report.grades.behaviorRaw}</td>
                    <td className="p-3 text-center text-gray-600">{report.grades.finalExamRaw}</td>
                    <td className="p-3 text-center font-medium">{report.grades.daily}</td>
                    <td className="p-3 text-center font-medium">{report.grades.weekly}</td>
                    <td className="p-3 text-center font-medium">{report.grades.monthly}</td>
                    <td className="p-3 text-center font-medium">{report.grades.behavior}</td>
                    <td className="p-3 text-center font-medium">{report.grades.finalExam}</td>
                    <td className="p-3 text-center font-bold bg-yellow-50">{report.grades.total}</td>
                    <td className={`p-3 text-center font-bold ${
                      report.grades.percentage >= 90 ? 'text-green-600 bg-green-50' :
                      report.grades.percentage >= 75 ? 'text-blue-600 bg-blue-50' :
                      report.grades.percentage >= 60 ? 'text-yellow-600 bg-yellow-50' :
                      'text-red-600 bg-red-50'
                    }`}>
                      {report.grades.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">الإحصائيات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
                <div className="text-sm text-gray-600">إجمالي الطالبات</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.grades.percentage >= 90).length}
                </div>
                <div className="text-sm text-gray-600">ممتاز (90%+)</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.grades.percentage >= 75 && r.grades.percentage < 90).length}
                </div>
                <div className="text-sm text-gray-600">جيد جداً (75-89%)</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.grades.percentage < 60).length}
                </div>
                <div className="text-sm text-gray-600">ضعيف (&lt;60%)</div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
