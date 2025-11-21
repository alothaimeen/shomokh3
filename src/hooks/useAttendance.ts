/**
 * Hook لإدارة الحضور مع SWR
 * يوفر caching ذكي مع تحديث فوري بعد التعديلات
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { AttendanceStatus } from '@prisma/client';

interface UseAttendanceOptions {
  courseId?: string;
  studentId?: string;
  date?: string;
}

interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string | null;
}

interface AttendanceResponse {
  data: Attendance[];
  success: boolean;
}

export function useAttendance(options: UseAttendanceOptions = {}) {
  const { courseId, studentId, date } = options;
  
  // بناء URL الاستعلام
  const params = new URLSearchParams();
  if (courseId) params.append('courseId', courseId);
  if (studentId) params.append('studentId', studentId);
  if (date) params.append('date', date);
  
  const url = params.toString() 
    ? `/api/attendance?${params.toString()}`
    : null;
  
  const { data, error, isLoading, mutate } = useSWR<AttendanceResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,      // تحديث عند العودة للصفحة
      dedupingInterval: 2000,       // منع استعلامات متكررة
      refreshInterval: 0,           // لا تحديث تلقائي
      revalidateOnReconnect: false,
    }
  );
  
  // تسجيل حضور واحد
  const markAttendance = async (attendance: {
    studentId: string;
    courseId: string;
    date: string;
    status: AttendanceStatus;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendance),
      });
      
      if (!response.ok) {
        throw new Error('فشل تسجيل الحضور');
      }
      
      // تحديث الـ cache فوراً
      await mutate();
      return await response.json();
    } catch (err) {
      console.error('Error marking attendance:', err);
      throw err;
    }
  };
  
  // تسجيل حضور جماعي
  const markBulkAttendance = async (records: Array<{
    studentId: string;
    courseId: string;
    date: string;
    status: AttendanceStatus;
    notes?: string;
  }>) => {
    try {
      const response = await fetch('/api/attendance/bulk-mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });
      
      if (!response.ok) {
        throw new Error('فشل تسجيل الحضور الجماعي');
      }
      
      // تحديث الـ cache فوراً
      await mutate();
      return await response.json();
    } catch (err) {
      console.error('Error marking bulk attendance:', err);
      throw err;
    }
  };
  
  return {
    attendance: data?.data || [],
    isLoading,
    error,
    markAttendance,
    markBulkAttendance,
    refresh: mutate,
  };
}
