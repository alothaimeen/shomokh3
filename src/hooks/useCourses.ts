/**
 * Hook لإدارة الحلقات والبرامج مع SWR
 * يوفر caching ذكي للبيانات شبه الثابتة
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface Program {
  id: string;
  programName: string;
  programDescription: string | null;
}

interface Course {
  id: string;
  courseName: string;
  courseDescription: string | null;
  maxStudents: number;
  programId: string;
  teacherId: string | null;
}

interface ProgramsResponse {
  data: Program[];
  success: boolean;
}

interface CoursesResponse {
  data: Course[];
  success: boolean;
}

// Hook لجلب البرامج
export function usePrograms() {
  const { data, error, isLoading, mutate } = useSWR<ProgramsResponse>(
    '/api/programs',
    fetcher,
    {
      revalidateOnFocus: false,     // البرامج لا تتغير كثيراً
      dedupingInterval: 5000,       // منع استعلامات متكررة لمدة 5 ثواني
      refreshInterval: 0,           // لا تحديث تلقائي
      revalidateOnReconnect: false,
    }
  );
  
  return {
    programs: data?.data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook لجلب الحلقات
export function useCourses(programId?: string) {
  const params = programId ? `?programId=${programId}` : '';
  
  const { data, error, isLoading, mutate } = useSWR<CoursesResponse>(
    `/api/courses${params}`,
    fetcher,
    {
      revalidateOnFocus: false,     // الحلقات لا تتغير كثيراً
      dedupingInterval: 5000,
      refreshInterval: 0,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    courses: data?.data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook لجلب حلقات المعلمة
export function useTeacherCourses(shouldFetch?: boolean) {
  const url = shouldFetch ? `/api/courses/teacher-courses` : null;
  
  const { data, error, isLoading, mutate } = useSWR<{ courses: any[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,      // تحديث عند العودة
      dedupingInterval: 3000,
      refreshInterval: 0,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    courses: data?.courses || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Hook لجلب حلقة واحدة
export function useCourse(courseId?: string) {
  const url = courseId ? `/api/courses/${courseId}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<{ data: Course; success: boolean }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      refreshInterval: 0,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    course: data?.data,
    isLoading,
    error,
    refresh: mutate,
  };
}
