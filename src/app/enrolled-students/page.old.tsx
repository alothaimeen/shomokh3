'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import { useEnrolledStudents } from '@/hooks/useEnrollments';
import { useTeacherCourses } from '@/hooks/useCourses';

interface Student {
  id: string;
  studentNumber: number;
  studentName: string;
  studentPhone: string;
  qualification: string;
  nationality: string;
  memorizedAmount: string;
  paymentStatus: string;
  memorizationPlan?: string;
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

interface CourseGroup {
  course: Course;
  students: Enrollment[];
  studentsCount: number;
}

interface EnrollmentData {
  enrollments: Enrollment[];
  enrollmentsByCourse: CourseGroup[];
  summary: {
    totalEnrollments: number;
    totalCourses: number;
    averageStudentsPerCourse: number;
  };
}

interface TeacherCourse {
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

export default function EnrolledStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [preSelectedCourse, setPreSelectedCourse] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'byCourse' | 'list'>('byCourse');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  // إدارة تعديل الاسم (الجلسة 10.6)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ استخدام SWR hooks بدلاً من useState + useEffect
  const { courses, isLoading: loadingCourses } = useTeacherCourses(session?.user?.role === 'TEACHER');
  const { enrollmentData, isLoading: loadingEnrollments, refresh } = useEnrolledStudents(preSelectedCourse);

  // التحقق من وجود courseId في URL أو اختيار أول حلقة
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseIdFromUrl = urlParams.get('courseId');
    if (courseIdFromUrl) {
      setPreSelectedCourse(courseIdFromUrl);
    } else if (courses.length > 0 && !preSelectedCourse) {
      setPreSelectedCourse(courses[0].id);
    }
  }, [courses, preSelectedCourse]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !['TEACHER', 'ADMIN'].includes(session.user.userRole)) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (processing) return;

    if (!confirm('هل أنت متأكد من إلغاء هذا التسجيل؟')) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/enrollment/cancel-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentId }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: data.message
        });
        refresh(); // ✅ تحديث SWR cache
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في إلغاء التسجيل'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleMultipleCancellation = async () => {
    if (processing || selectedEnrollments.length === 0) return;

    if (!confirm(`هل أنت متأكد من إلغاء ${selectedEnrollments.length} تسجيل؟`)) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/enrollment/cancel-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentIds: selectedEnrollments }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: data.message
        });
        refresh(); // ✅ تحديث SWR cache
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في إلغاء التسجيلات'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectEnrollment = (enrollmentId: string) => {
    setSelectedEnrollments(prev =>
      prev.includes(enrollmentId)
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const handleSelectAll = () => {
    if (!enrollmentData) return;

    const allIds = enrollmentData.enrollments.map(e => e.id);
    setSelectedEnrollments(
      selectedEnrollments.length === allIds.length ? [] : allIds
    );
  };

  // دالة فتح Modal تعديل الاسم (الجلسة 10.6)
  const openEditNameModal = (student: Student) => {
    setEditingStudent(student);
    setNewStudentName(student.studentName);
    setIsEditModalOpen(true);
  };

  // دالة إغلاق Modal
  const closeEditNameModal = () => {
    setEditingStudent(null);
    setNewStudentName('');
    setIsEditModalOpen(false);
  };

  // دالة تعديل اسم الطالبة (الجلسة 10.6)
  const handleUpdateStudentName = async () => {
    if (!editingStudent || !newStudentName.trim() || processing) return;

    if (newStudentName.trim() === editingStudent.studentName) {
      setNotification({
        type: 'error',
        message: 'الاسم الجديد مطابق للاسم الحالي'
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/students/${editingStudent.id}/update-name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName: newStudentName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: data.message || 'تم تحديث اسم الطالبة بنجاح'
        });
        closeEditNameModal();
        refresh(); // ✅ تحديث SWR cache
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في تحديث اسم الطالبة'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600';
      case 'UNPAID':
        return 'text-red-600';
      case 'PARTIAL':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'مسدد';
      case 'UNPAID':
        return 'غير مسدد';
      case 'PARTIAL':
        return 'مسدد جزئياً';
      default:
        return status;
    }
  };

  const filteredData = enrollmentData
    ? {
        ...enrollmentData,
        enrollments: enrollmentData.enrollments.filter(enrollment =>
          (selectedCourse === '' || enrollment.course.id === selectedCourse) &&
          (searchTerm === '' ||
            enrollment.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.student.studentNumber.toString().includes(searchTerm) ||
            enrollment.student.studentPhone.includes(searchTerm) ||
            enrollment.course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ),
        enrollmentsByCourse: enrollmentData.enrollmentsByCourse
          .map(group => ({
            ...group,
            students: group.students.filter(enrollment =>
              (selectedCourse === '' || enrollment.course.id === selectedCourse) &&
              (searchTerm === '' ||
                enrollment.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.student.studentNumber.toString().includes(searchTerm) ||
                enrollment.student.studentPhone.includes(searchTerm) ||
                enrollment.course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
          }))
          .filter(group => group.students.length > 0)
      }
    : null;

  if (status === 'loading' || loadingCourses || loadingEnrollments) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:mr-72 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:mr-72 flex items-center justify-center">
          <div className="text-lg text-red-600">خطأ في تحميل البيانات</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="الطالبات المسجلات" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">الطالبات المسجلات</h1>
          <p className="text-gray-600 mb-6">إدارة ومتابعة الطالبات المسجلات في الحلقات</p>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {notification.message}
          </div>
        )}

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{enrollmentData.summary.totalEnrollments}</div>
            <div className="text-gray-600">إجمالي التسجيلات</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{enrollmentData.summary.totalCourses}</div>
            <div className="text-gray-600">عدد الحلقات</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{enrollmentData.summary.averageStudentsPerCourse}</div>
            <div className="text-gray-600">متوسط الطالبات لكل حلقة</div>
          </div>
        </div>

        {/* أدوات التحكم */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('byCourse')}
                  className={`px-4 py-2 rounded ${
                    viewMode === 'byCourse'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  عرض حسب الحلقة
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  عرض كقائمة
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">كل الحلقات</option>
                  {enrollmentData.enrollmentsByCourse.map(group => (
                    <option key={group.course.id} value={group.course.id}>
                      {group.course.courseName} ({group.studentsCount})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* إجراءات جماعية */}
            {selectedEnrollments.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    تم اختيار {selectedEnrollments.length} تسجيل
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedEnrollments([])}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    >
                      إلغاء الاختيار
                    </button>
                    <button
                      onClick={handleMultipleCancellation}
                      disabled={processing}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded"
                    >
                      إلغاء المحدد
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* المحتوى */}
          <div className="p-6">
            {filteredData && filteredData.enrollments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد تسجيلات للعرض
              </div>
            ) : (
              <div>
                {/* عرض حسب الحلقة */}
                {viewMode === 'byCourse' && filteredData && (
                  <div className="space-y-6">
                    {filteredData.enrollmentsByCourse.map((group) => (
                      <div key={group.course.id} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-800">{group.course.courseName}</h3>
                              <p className="text-sm text-gray-600">
                                {group.course.programName} - المستوى {group.course.level}
                                {session && session.user.userRole !== 'TEACHER' && (
                                  <span className="ml-2">المعلمة: {group.course.teacherName}</span>
                                )}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-blue-600">
                              {group.studentsCount}/{group.course.maxStudents} طالبة
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid gap-3">
                            {group.students.map((enrollment) => (
                              <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedEnrollments.includes(enrollment.id)}
                                    onChange={() => handleSelectEnrollment(enrollment.id)}
                                    className="mr-3"
                                  />
                                  <div>
                                    <div className="font-medium text-gray-800">
                                      {enrollment.student.studentName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      رقم: {enrollment.student.studentNumber} |
                                      هاتف: {enrollment.student.studentPhone} |
                                      <span className={getPaymentStatusColor(enrollment.student.paymentStatus)}>
                                        {getPaymentStatusText(enrollment.student.paymentStatus)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openEditNameModal(enrollment.student)}
                                    disabled={processing}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded"
                                    title="تعديل الاسم"
                                  >
                                    ✏️ تعديل الاسم
                                  </button>
                                  <button
                                    onClick={() => handleCancelEnrollment(enrollment.id)}
                                    disabled={processing}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded"
                                  >
                                    إلغاء التسجيل
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* عرض كقائمة */}
                {viewMode === 'list' && filteredData && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                      >
                        {selectedEnrollments.length === filteredData.enrollments.length ? 'إلغاء الكل' : 'اختيار الكل'}
                      </button>
                    </div>

                    {filteredData.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedEnrollments.includes(enrollment.id)}
                            onChange={() => handleSelectEnrollment(enrollment.id)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-800">
                              {enrollment.student.studentName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {enrollment.course.courseName} - {enrollment.course.programName}
                              {session && session.user.userRole !== 'TEACHER' && (
                                <span className="ml-2">| المعلمة: {enrollment.course.teacherName}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              رقم: {enrollment.student.studentNumber} |
                              هاتف: {enrollment.student.studentPhone} |
                              <span className={getPaymentStatusColor(enrollment.student.paymentStatus)}>
                                {getPaymentStatusText(enrollment.student.paymentStatus)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditNameModal(enrollment.student)}
                            disabled={processing}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded"
                            title="تعديل الاسم"
                          >
                            ✏️ تعديل الاسم
                          </button>
                          <button
                            onClick={() => handleCancelEnrollment(enrollment.id)}
                            disabled={processing}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded"
                          >
                            إلغاء التسجيل
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal تعديل اسم الطالبة (الجلسة 10.6) */}
        {isEditModalOpen && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">تعديل اسم الطالبة</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  الاسم الحالي:
                </label>
                <p className="text-gray-900 bg-gray-100 p-2 rounded">
                  {editingStudent.studentName}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  الاسم الجديد: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل الاسم الجديد"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeEditNameModal}
                  disabled={processing}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpdateStudentName}
                  disabled={processing || !newStudentName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg"
                >
                  {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* العودة للوحة التحكم */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
