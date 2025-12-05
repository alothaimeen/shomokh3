'use client';

import { useState, useTransition, useEffect } from 'react';
import { 
  getProgramWithCourses, 
  getTeachers, 
  createCourse, 
  assignTeacherToCourse, 
  toggleCourseStatus 
} from '@/actions/courses';

interface Course {
  id: string;
  courseName: string;
  courseDescription: string;
  syllabus: string;
  level: number;
  maxStudents: number;
  teacherId?: string;
  teacherName?: string;
  isActive: boolean;
  createdAt: string;
  studentsCount: number;
}

interface Teacher {
  id: string;
  userName: string;
}

interface CoursesContentProps {
  programId: string;
  userRole: string;
}

export default function CoursesContent({ programId, userRole }: CoursesContentProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programName, setProgramName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    courseDescription: '',
    syllabus: '',
    level: 1,
    maxStudents: 20,
    teacherId: ''
  });

  const canManageCourses = userRole === 'ADMIN';

  // إخفاء الإشعار تلقائياً
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // جلب البيانات الأولية
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // جلب البرنامج والحلقات
        const programResult = await getProgramWithCourses(programId);
        if (programResult.error) {
          setError(programResult.error);
          return;
        }
        
        setProgramName(programResult.program?.programName || '');
        setCourses(programResult.courses || []);

        // جلب المعلمات (للـ Admin فقط)
        if (canManageCourses) {
          const teachersResult = await getTeachers();
          setTeachers(teachersResult.teachers || []);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [programId, canManageCourses]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 text-lg mb-4">{error}</p>
      </div>
    );
  }

  const handleAddCourse = async () => {
    if (!newCourse.courseName.trim()) {
      setNotification({ type: 'error', message: 'يرجى إدخال اسم الحلقة' });
      return;
    }

    const formData = new FormData();
    formData.append('programId', programId);
    formData.append('courseName', newCourse.courseName);
    formData.append('courseDescription', newCourse.courseDescription);
    formData.append('syllabus', newCourse.syllabus);
    formData.append('level', newCourse.level.toString());
    formData.append('maxStudents', newCourse.maxStudents.toString());
    formData.append('teacherId', newCourse.teacherId);

    startTransition(async () => {
      const result = await createCourse(formData);
      if (result.error) {
        setNotification({ type: 'error', message: result.error });
      } else {
        setNotification({ type: 'success', message: 'تم إضافة الحلقة بنجاح' });
        // إعادة جلب البيانات
        const programResult = await getProgramWithCourses(programId);
        if (!programResult.error) {
          setCourses(programResult.courses || []);
        }
        setNewCourse({
          courseName: '',
          courseDescription: '',
          syllabus: '',
          level: 1,
          maxStudents: 20,
          teacherId: ''
        });
        setShowAddForm(false);
      }
    });
  };

  const handleToggleCourseStatus = async (courseId: string) => {
    startTransition(async () => {
      const result = await toggleCourseStatus(courseId);
      if (result.error) {
        setNotification({ type: 'error', message: result.error });
      } else {
        // تحديث الحالة محلياً
        setCourses(courses.map(course =>
          course.id === courseId
            ? { ...course, isActive: result.isActive! }
            : course
        ));
        setNotification({ type: 'success', message: result.isActive ? 'تم تفعيل الحلقة' : 'تم إيقاف الحلقة' });
      }
    });
  };

  const handleAssignTeacher = async (courseId: string, teacherId: string) => {
    startTransition(async () => {
      const result = await assignTeacherToCourse(courseId, teacherId || null);
      if (result.error) {
        setNotification({ type: 'error', message: result.error });
      } else {
        // تحديث الحالة محلياً
        const selectedTeacher = teachers.find(t => t.id === teacherId);
        setCourses(courses.map(course =>
          course.id === courseId
            ? { 
                ...course, 
                teacherId: teacherId || undefined, 
                teacherName: selectedTeacher?.userName 
              }
            : course
        ));
        setNotification({ type: 'success', message: 'تم تعيين المعلمة بنجاح' });
      }
    });
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          📚 حلقات {programName}
        </h1>
        <p className="text-gray-600">إدارة وتنظيم الحلقات التعليمية ({courses.length} حلقة)</p>
      </div>

      {/* Add Course Button */}
      {canManageCourses && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            إضافة حلقة جديدة
          </button>
        </div>
      )}

      {/* Add Course Form */}
      {showAddForm && canManageCourses && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">إضافة حلقة جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الحلقة
              </label>
              <input
                type="text"
                value={newCourse.courseName}
                onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسم الحلقة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى
              </label>
              <select
                value={newCourse.level}
                onChange={(e) => setNewCourse({...newCourse, level: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>المستوى الأول</option>
                <option value={2}>المستوى الثاني</option>
                <option value={3}>المستوى الثالث</option>
                <option value={4}>المستوى الرابع</option>
                <option value={5}>المستوى الخامس</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النصاب (المنهج)
              </label>
              <input
                type="text"
                value={newCourse.syllabus}
                onChange={(e) => setNewCourse({...newCourse, syllabus: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثل: جزء عم، سورة البقرة، إلخ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العدد الأقصى للطالبات
              </label>
              <input
                type="number"
                value={newCourse.maxStudents}
                onChange={(e) => setNewCourse({...newCourse, maxStudents: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المعلمة المسؤولة
              </label>
              <select
                value={newCourse.teacherId}
                onChange={(e) => setNewCourse({...newCourse, teacherId: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر معلمة</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.userName}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الحلقة
              </label>
              <textarea
                value={newCourse.courseDescription}
                onChange={(e) => setNewCourse({...newCourse, courseDescription: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="أدخل وصف الحلقة"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                onClick={handleAddCourse}
                disabled={isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'جاري الإضافة...' : 'إضافة الحلقة'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            قائمة الحلقات ({courses.length})
          </h3>

          {courses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد حلقات مضافة لهذا البرنامج حتى الآن</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {course.courseName}
                        </h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          المستوى {course.level}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-2">{course.courseDescription}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div>📚 <strong>النصاب:</strong> {course.syllabus || 'غير محدد'}</div>
                        <div>👥 <strong>الطالبات:</strong> {course.studentsCount}/{course.maxStudents}</div>
                        <div>👩‍🏫 <strong>المعلمة:</strong> {course.teacherName || 'غير محددة'}</div>
                        <div>📅 <strong>التاريخ:</strong> {course.createdAt}</div>
                      </div>

                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        course.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? 'نشطة' : 'غير نشطة'}
                      </span>
                    </div>

                    {canManageCourses && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleToggleCourseStatus(course.id)}
                          disabled={isPending}
                          className={`px-3 py-1 rounded text-sm ${
                            course.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } transition-colors disabled:opacity-50`}
                        >
                          {course.isActive ? 'إيقاف' : 'تفعيل'}
                        </button>
                        <select
                          value={course.teacherId || ''}
                          onChange={(e) => handleAssignTeacher(course.id, e.target.value)}
                          disabled={isPending}
                          className="text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                        >
                          <option value="">بدون معلمة</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.userName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
