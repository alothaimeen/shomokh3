'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelEnrollment, cancelMultipleEnrollments, updateStudentName } from '@/actions/enrollments-manage';

interface Student {
  id: string;
  studentNumber: number;
  studentName: string;
  studentPhone: string;
  qualification: string;
  nationality: string;
  memorizedAmount: string;
  paymentStatus: string;
  memorizationPlan?: string | null;
}

interface Course {
  id: string;
  courseName: string;
  level: number;
  maxStudents: number;
  programName: string;
  teacherName: string;
}

interface Enrollment {
  id: string;
  enrolledAt: string;
  student: Student;
  course: Course;
}

interface CourseOption {
  id: string;
  courseName: string;
  level: number;
  maxStudents: number;
  programName: string;
  enrollmentsCount: number;
}

interface Props {
  courses: CourseOption[];
  enrollments: Enrollment[];
  selectedCourseId: string;
}

export default function EnrolledStudentsManager({ courses, enrollments, selectedCourseId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState('');

  const handleCourseChange = (courseId: string) => {
    router.push(`/enrolled-students?courseId=${courseId}`);
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا التسجيل؟')) return;

    startTransition(async () => {
      const result = await cancelEnrollment(enrollmentId);
      if (!result.success) {
        setNotification({ type: 'error', message: result.error || 'حدث خطأ' });
      } else {
        setNotification({ type: 'success', message: result.message || 'تم إلغاء التسجيل' });
      }
    });
  };

  const handleMultipleCancellation = async () => {
    if (selectedEnrollments.length === 0) return;
    if (!confirm(`هل أنت متأكد من إلغاء ${selectedEnrollments.length} تسجيل؟`)) return;

    startTransition(async () => {
      const result = await cancelMultipleEnrollments(selectedEnrollments);
      if (!result.success) {
        setNotification({ type: 'error', message: result.error || 'حدث خطأ' });
      } else {
        setNotification({ type: 'success', message: result.message || 'تم الإلغاء' });
        setSelectedEnrollments([]);
      }
    });
  };

  const handleEditName = (student: Student) => {
    setEditingStudent(student);
    setNewStudentName(student.studentName);
  };

  const handleSaveName = async () => {
    if (!editingStudent) return;

    startTransition(async () => {
      const result = await updateStudentName(editingStudent.id, newStudentName);
      if (!result.success) {
        setNotification({ type: 'error', message: result.error || 'حدث خطأ' });
      } else {
        setNotification({ type: 'success', message: result.message || 'تم التحديث' });
        setEditingStudent(null);
      }
    });
  };

  const handleSelectEnrollment = (enrollmentId: string) => {
    setSelectedEnrollments(prev =>
      prev.includes(enrollmentId)
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEnrollments(
      selectedEnrollments.length === enrollments.length 
        ? [] 
        : enrollments.map(e => e.id)
    );
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student.studentNumber.toString().includes(searchTerm) ||
    enrollment.student.studentPhone.includes(searchTerm)
  );

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <>
      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}

      {/* اختيار الحلقة */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">اختر الحلقة</label>
        <select
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseName} - {course.programName} ({course.enrollmentsCount}/{course.maxStudents})
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-2">{selectedCourse.courseName}</h2>
          <p className="text-sm">البرنامج: {selectedCourse.programName}</p>
          <p className="text-sm">عدد الطلاب: {enrollments.length} / {selectedCourse.maxStudents}</p>
        </div>
      )}

      {/* البحث والإجراءات الجماعية */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="البحث بالاسم، الرقم، أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {enrollments.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                {selectedEnrollments.length === enrollments.length ? 'إلغاء الكل' : 'اختيار الكل'}
              </button>
              
              {selectedEnrollments.length > 0 && (
                <button
                  onClick={handleMultipleCancellation}
                  disabled={isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                >
                  إلغاء المحدد ({selectedEnrollments.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* جدول الطلاب */}
      {filteredEnrollments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">لا توجد طلاب مسجلين</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-right"><input type="checkbox" onChange={handleSelectAll} checked={selectedEnrollments.length === enrollments.length} /></th>
                <th className="p-3 text-right">الرقم</th>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">الهاتف</th>
                <th className="p-3 text-right">المؤهل</th>
                <th className="p-3 text-right">الجنسية</th>
                <th className="p-3 text-right">الحفظ</th>
                <th className="p-3 text-right">السداد</th>
                <th className="p-3 text-right">تاريخ التسجيل</th>
                <th className="p-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selectedEnrollments.includes(enrollment.id)}
                      onChange={() => handleSelectEnrollment(enrollment.id)}
                    />
                  </td>
                  <td className="p-3">{enrollment.student.studentNumber}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleEditName(enrollment.student)}
                      className="text-blue-600 hover:underline"
                    >
                      {enrollment.student.studentName}
                    </button>
                  </td>
                  <td className="p-3">{enrollment.student.studentPhone}</td>
                  <td className="p-3">{enrollment.student.qualification}</td>
                  <td className="p-3">{enrollment.student.nationality}</td>
                  <td className="p-3">{enrollment.student.memorizedAmount}</td>
                  <td className="p-3">
                    <span className={
                      enrollment.student.paymentStatus === 'PAID' ? 'text-green-600' :
                      enrollment.student.paymentStatus === 'UNPAID' ? 'text-red-600' : 'text-yellow-600'
                    }>
                      {enrollment.student.paymentStatus === 'PAID' ? 'مسدد' :
                       enrollment.student.paymentStatus === 'UNPAID' ? 'غير مسدد' : 'جزئي'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{new Date(enrollment.enrolledAt).toLocaleDateString('ar-SA')}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleCancelEnrollment(enrollment.id)}
                      disabled={isPending}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white text-xs rounded"
                    >
                      إلغاء
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة تعديل الاسم */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">تعديل اسم الطالبة</h3>
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
              placeholder="الاسم الجديد"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveName}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded"
              >
                حفظ
              </button>
              <button
                onClick={() => setEditingStudent(null)}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
