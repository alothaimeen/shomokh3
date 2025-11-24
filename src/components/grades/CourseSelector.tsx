'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface CourseSelectorProps {
  courses: Array<{ id: string; courseName: string; _count?: { enrollments?: number } }>;
  selectedCourseId: string;
  currentDate?: string;
  currentWeek?: number;
  currentMonth?: number;
  pageType: 'daily' | 'weekly' | 'monthly' | 'behavior';
}

export default function CourseSelector({
  courses,
  selectedCourseId,
  currentDate,
  currentWeek,
  currentMonth,
  pageType
}: CourseSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCourseChange = (courseId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('courseId', courseId);
    
    switch (pageType) {
      case 'daily':
        if (currentDate) params.set('date', currentDate);
        router.replace(`/daily-grades?${params.toString()}`, { scroll: false });
        break;
      case 'weekly':
        if (currentWeek) params.set('week', currentWeek.toString());
        router.replace(`/weekly-grades?${params.toString()}`, { scroll: false });
        break;
      case 'monthly':
        if (currentMonth) params.set('month', currentMonth.toString());
        router.replace(`/monthly-grades?${params.toString()}`, { scroll: false });
        break;
      case 'behavior':
        if (currentDate) params.set('date', currentDate);
        router.replace(`/behavior-points?${params.toString()}`, { scroll: false });
        break;
    }
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-700 mb-2">الحلقة:</label>
      <select
        value={selectedCourseId}
        onChange={(e) => handleCourseChange(e.target.value)}
        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.courseName} ({course._count?.enrollments || 0} طالبة)
          </option>
        ))}
      </select>
    </div>
  );
}
