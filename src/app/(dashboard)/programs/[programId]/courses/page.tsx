'use client';

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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

interface ProgramData {
  id: string;
  programName: string;
  courses: Course[];
}

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const programId = params.programId as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programName, setProgramName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    courseDescription: '',
    syllabus: '',
    level: 1,
    maxStudents: 20,
    teacherId: ''
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // جلب المعلمات من قاعدة البيانات
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch('/api/users?role=TEACHER');
        if (res.ok) {
          const data = await res.json();
          setTeachers(data.users || []);
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
      }
    }
    fetchTeachers();
  }, []);

  // جلب البرنامج والحلقات من قاعدة البيانات
  useEffect(() => {
    async function fetchProgramData() {
      if (!programId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/programs/${programId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('البرنامج غير موجود');
          } else {
            setError('حدث خطأ أثناء جلب البيانات');
          }
          return;
        }
        
        const data: ProgramData = await res.json();
        setProgramName(data.programName);
        setCourses(data.courses || []);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('حدث خطأ في الاتصال');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProgramData();
  }, [programId]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link href="/programs" className="text-blue-600 hover:underline">
            ← العودة للبرامج
          </Link>
        </div>
      </div>
    );
  }

  const userRole = session.user?.role;
  const canManageCourses = userRole === 'ADMIN';

  const handleAddCourse = () => {
    if (newCourse.courseName.trim()) {
      const selectedTeacher = teachers.find(t => t.id === newCourse.teacherId);
      const course: Course = {
        id: Date.now().toString(),
        courseName: newCourse.courseName,
        courseDescription: newCourse.courseDescription,
        syllabus: newCourse.syllabus,
        level: newCourse.level,
        maxStudents: newCourse.maxStudents,
        teacherId: newCourse.teacherId || undefined,
        teacherName: selectedTeacher?.userName,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        studentsCount: 0
      };
      setCourses([...courses, course]);
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
  };

  const toggleCourseStatus = (courseId: string) => {
    setCourses(courses.map(course =>
      course.id === courseId
        ? { ...course, isActive: !course.isActive }
        : course
    ));
  };

  const assignTeacher = (courseId: string, teacherId: string) => {
    const selectedTeacher = teachers.find(t => t.id === teacherId);
    setCourses(courses.map(course =>
      course.id === courseId
        ? { ...course, teacherId, teacherName: selectedTeacher?.userName }
        : course
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* زر الرجوع */}
          <Link
            href="/programs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            ← رجوع للبرامج
          </Link>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📚 حلقات {programName}
              </h1>
              <p className="text-gray-600 mt-1">إدارة وتنظيم الحلقات التعليمية ({courses.length} حلقة)</p>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
                لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Add Course Button */}
          {canManageCourses && (
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    إضافة الحلقة
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
                            <div>📚 <strong>النصاب:</strong> {course.syllabus}</div>
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
                              onClick={() => toggleCourseStatus(course.id)}
                              className={`px-3 py-1 rounded text-sm ${
                                course.isActive
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } transition-colors`}
                            >
                              {course.isActive ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <select
                              value={course.teacherId || ''}
                              onChange={(e) => assignTeacher(course.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
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

        </div>
      </main>
    </div>
  );
}