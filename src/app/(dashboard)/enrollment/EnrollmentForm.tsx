'use client';

import { useActionState } from 'react';
import { enrollInCourse } from '@/actions/enrollment';
import type { CourseWithTeacher, ActionResponse } from '@/types';

export function EnrollmentForm({ course }: { course: CourseWithTeacher }) {
  const initialState: ActionResponse<{ enrollmentId: string }> = { 
    success: false, 
    error: '' 
  };
  
  const [state, formAction, isPending] = useActionState(
    enrollInCourse,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={course.id} />
      
      <div>
        <label className="block text-sm font-medium mb-2">
          رسالة للمعلمة (اختياري)
        </label>
        <textarea
          name="message"
          disabled={isPending}
          maxLength={500}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="أخبري المعلمة عن مستواك..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {isPending ? 'جاري الإرسال...' : 'إرسال طلب الانضمام'}
      </button>

      {!state.success && state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {state.error}
        </div>
      )}

      {state.success && state.message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
          {state.message}
        </div>
      )}
    </form>
  );
}
