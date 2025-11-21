/**
 * Hook لإدارة الدرجات مع SWR
 * يوفر caching ذكي مع تحديث فوري بعد التعديلات
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface UseGradesOptions {
  courseId?: string;
  studentId?: string;
  date?: string;
}

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  date: Date;
  memorization: number | null;
  review: number | null;
  notes: string | null;
}

interface GradesResponse {
  data: Grade[];
  success: boolean;
}

export function useGrades(options: UseGradesOptions = {}) {
  const { courseId, studentId, date } = options;
  
  // بناء URL الاستعلام
  const params = new URLSearchParams();
  if (courseId) params.append('courseId', courseId);
  if (studentId) params.append('studentId', studentId);
  if (date) params.append('date', date);
  
  const url = params.toString() 
    ? `/api/grades?${params.toString()}`
    : null; // لا تجلب البيانات إذا لم يكن هناك معايير
  
  const { data, error, isLoading, mutate } = useSWR<GradesResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,      // تحديث عند العودة للصفحة
      dedupingInterval: 2000,       // منع استعلامات متكررة خلال 2 ثانية
      refreshInterval: 0,           // لا تحديث تلقائي (بيانات يومية)
      revalidateOnReconnect: false, // لا تحديث عند إعادة الاتصال
    }
  );
  
  // حفظ درجة مع تحديث فوري
  const saveGrade = async (grade: Partial<Grade>) => {
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grade),
      });
      
      if (!response.ok) {
        throw new Error('فشل حفظ الدرجة');
      }
      
      // تحديث الـ cache فوراً
      await mutate();
      return await response.json();
    } catch (err) {
      console.error('Error saving grade:', err);
      throw err;
    }
  };
  
  // حفظ درجات جماعية
  const saveBulkGrades = async (grades: Partial<Grade>[]) => {
    try {
      const response = await fetch('/api/grades/bulk-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades }),
      });
      
      if (!response.ok) {
        throw new Error('فشل حفظ الدرجات');
      }
      
      // تحديث الـ cache فوراً
      await mutate();
      return await response.json();
    } catch (err) {
      console.error('Error saving bulk grades:', err);
      throw err;
    }
  };
  
  return {
    grades: data?.data || [],
    isLoading,
    error,
    saveGrade,
    saveBulkGrades,
    refresh: mutate,
  };
}
