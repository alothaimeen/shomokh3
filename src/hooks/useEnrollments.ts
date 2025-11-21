/**
 * Hook لإدارة التسجيلات مع SWR
 * يوفر caching ذكي وتحديثات فورية
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

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

/**
 * Hook لجلب الطالبات المسجلات في حلقة معينة
 */
export function useEnrolledStudents(courseId?: string) {
  const url = courseId 
    ? `/api/enrollment/enrolled-students?courseId=${courseId}`
    : '/api/enrollment/enrolled-students';
  
  const { data, error, isLoading, mutate } = useSWR<EnrollmentData>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,      // تحديث عند العودة للصفحة
      dedupingInterval: 2000,       // منع استعلامات متكررة لمدة 2 ثانية
      refreshInterval: 0,           // لا تحديث تلقائي
      revalidateOnReconnect: false,
    }
  );
  
  return {
    enrollmentData: data || null,
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * Hook لجلب تسجيلات الطالبة
 * @param shouldFetch - هل يجب جلب البيانات (استخدم false للأدوار غير الطالبة)
 */
export function useMyEnrollments(shouldFetch: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR<{ enrollments: Enrollment[] }>(
    shouldFetch ? '/api/enrollment/my-enrollments' : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
      refreshInterval: 0,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    enrollments: data?.enrollments || [],
    isLoading,
    error,
    refresh: mutate,
  };
}
