'use client';

import { useRouter, usePathname } from 'next/navigation';

interface Enrollment {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  teacherName: string;
}

interface CourseSelectorProps {
  enrollments: Enrollment[];
  selectedCourseId: string;
  selectedDate: string;
}

export default function CourseSelector({ 
  enrollments, 
  selectedCourseId, 
  selectedDate 
}: CourseSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCourseChange = (courseId: string) => {
    router.push(`${pathname}?courseId=${courseId}&date=${selectedDate}`);
  };

  const handleDateChange = (date: string) => {
    router.push(`${pathname}?courseId=${selectedCourseId}&date=${date}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {enrollments.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اختاري الحلقة</label>
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {enrollments.map((enrollment) => (
              <option key={enrollment.id} value={enrollment.id}>
                {enrollment.courseName} - {enrollment.programName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
