'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/shared/Sidebar";
import AppHeader from "@/components/shared/AppHeader";
import HijriDateDisplay from "@/components/shared/HijriDateDisplay";
import { Users, BookOpen, GraduationCap, UserCheck, Calendar, FileText, BarChart3, ClipboardCheck, Star, Award, ListChecks } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useTeacherCourses } from '@/hooks/useCourses';
import { useMyEnrollments } from '@/hooks/useEnrollments';

interface TeacherCourse {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  studentsCount: number;
}

interface StudentEnrollment {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  teacherName: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // ✅ SWR للإحصائيات
  const { data: statsData, isLoading: loadingStats } = useSWR(
    session ? '/api/dashboard/stats' : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 2000 }
  );
  const stats = statsData || null;
  
  // ✅ SWR لحلقات المعلمة
  const { courses: teacherCourses, isLoading: loadingCourses } = useTeacherCourses(
    session?.user?.role === 'TEACHER'
  );
  
  // ✅ SWR لتسجيلات الطالبة (فقط للطالبات)
  const { enrollments: studentEnrollments, isLoading: loadingEnrollments } = useMyEnrollments(
    session?.user?.role === 'STUDENT'
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user?.role;
  const currentStats: any = stats || {
    totalUsers: 0,
    totalPrograms: 0,
    totalCourses: 0,
    totalStudents: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:mr-72">
        <AppHeader title="لوحة التحكم" />
        
        <main className="p-6 space-y-6">
          {/* التاريخ الهجري */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <HijriDateDisplay format="full" />
          </div>

          {/* مديرة - الإحصائيات */}
          {userRole === 'ADMIN' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-purple">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">المستخدمون</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loadingStats ? '...' : currentStats.totalUsers}
                      </p>
                    </div>
                    <Users className="text-primary-purple" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-blue">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">البرامج</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loadingStats ? '...' : currentStats.totalPrograms}
                      </p>
                    </div>
                    <BookOpen className="text-primary-blue" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-purple">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">الحلقات</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loadingStats ? '...' : currentStats.totalCourses}
                      </p>
                    </div>
                    <GraduationCap className="text-primary-purple" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-blue">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">الطالبات</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loadingStats ? '...' : currentStats.totalStudents}
                      </p>
                    </div>
                    <UserCheck className="text-primary-blue" size={40} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">الإجراءات السريعة</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/users" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Users size={20} />
                    <span>المستخدمين</span>
                  </Link>
                  <Link href="/programs" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <BookOpen size={20} />
                    <span>البرامج</span>
                  </Link>
                  <Link href="/students" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <UserCheck size={20} />
                    <span>الطالبات</span>
                  </Link>
                  <Link href="/enrolled-students" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <GraduationCap size={20} />
                    <span>المسجلات</span>
                  </Link>
                  <Link href="/attendance" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Calendar size={20} />
                    <span>الحضور</span>
                  </Link>
                  <Link href="/attendance-report" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <FileText size={20} />
                    <span>تقرير الحضور</span>
                  </Link>
                  <Link href="/teacher-requests" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <ClipboardCheck size={20} />
                    <span>الطلبات</span>
                  </Link>
                  <Link href="/academic-reports" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <BarChart3 size={20} />
                    <span>التقارير</span>
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* معلمة - حلقاتي */}
          {userRole === 'TEACHER' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">حلقاتي</h3>
              {loadingCourses ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
                  <p className="mt-2 text-gray-600">جاري تحميل الحلقات...</p>
                </div>
              ) : teacherCourses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد حلقات مسندة لك حالياً</p>
              ) : (
                <div className="space-y-4">
                  {teacherCourses.map((course: any) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">{course.courseName}</h4>
                        <p className="text-sm text-gray-600">
                          {course.programName} - المستوى {course.level} - {course.studentsCount} طالبة
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <Link href={`/attendance?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <Calendar size={16} />
                          <span>الحضور</span>
                        </Link>
                        <Link href={`/unified-assessment?courseId=${course.id}`} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <GraduationCap size={16} />
                          <span>واجهة الدرجات</span>
                        </Link>
                        <Link href={`/daily-grades?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <ClipboardCheck size={16} />
                          <span>يومي</span>
                        </Link>
                        <Link href={`/weekly-grades?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <FileText size={16} />
                          <span>أسبوعي</span>
                        </Link>
                        <Link href={`/monthly-grades?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <GraduationCap size={16} />
                          <span>شهري</span>
                        </Link>
                        <Link href={`/behavior-grades?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <Star size={16} />
                          <span>السلوك</span>
                        </Link>
                        <Link href={`/behavior-points?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <Award size={16} />
                          <span>النقاط</span>
                        </Link>
                        <Link href={`/final-exam?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <FileText size={16} />
                          <span>النهائي</span>
                        </Link>
                        <Link href={`/enrolled-students?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <UserCheck size={16} />
                          <span>الطالبات</span>
                        </Link>
                        <Link href={`/academic-reports?courseId=${course.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <BarChart3 size={16} />
                          <span>التقرير</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* طالبة - حلقاتي */}
          {userRole === 'STUDENT' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">حلقاتي المسجلة</h3>
                {loadingEnrollments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple mx-auto"></div>
                    <p className="mt-2 text-gray-600">جاري تحميل الحلقات...</p>
                  </div>
                ) : studentEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">لم تسجلي في أي حلقة بعد</p>
                    <Link href="/enrollment" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-6 py-3 rounded-lg inline-block font-semibold hover:shadow-lg transition-all">
                      📝 طلب الانضمام للحلقات
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentEnrollments.map((enrollment: any) => (
                      <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{enrollment.courseName}</h4>
                          <p className="text-sm text-gray-600">
                            {enrollment.programName} - المستوى {enrollment.level} - المعلمة: {enrollment.teacherName}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <Link href={`/my-attendance?courseId=${enrollment.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                            <Calendar size={16} />
                            <span>حضوري</span>
                          </Link>
                          <Link href={`/my-grades?courseId=${enrollment.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                            <GraduationCap size={16} />
                            <span>درجاتي</span>
                          </Link>
                          <Link href={`/daily-tasks?courseId=${enrollment.id}`} className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-3 py-2 rounded-lg text-sm text-center font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2">
                            <ListChecks size={16} />
                            <span>مهامي</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">روابط سريعة</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Link href="/my-attendance" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex flex-col items-center justify-center gap-2">
                    <Calendar size={24} />
                    <span className="text-sm">حضوري</span>
                  </Link>
                  <Link href="/my-grades" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex flex-col items-center justify-center gap-2">
                    <GraduationCap size={24} />
                    <span className="text-sm">درجاتي</span>
                  </Link>
                  <Link href="/enrollment" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-4 py-3 rounded-lg text-center font-semibold hover:shadow-lg transition-all flex flex-col items-center justify-center gap-2">
                    <BookOpen size={24} />
                    <span className="text-sm">الانضمام</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
