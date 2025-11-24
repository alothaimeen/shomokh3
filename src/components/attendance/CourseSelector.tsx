'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Course {
  id: string;
  courseName: string;
  programName: string;
  level: number;
}

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse: string;
  selectedDate: string;
}

export default function CourseSelector({ courses, selectedCourse, selectedDate }: CourseSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCourseChange = (courseId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('courseId', courseId);
    params.set('date', selectedDate);
    router.push(`/attendance?${params.toString()}`);
  };

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('courseId', selectedCourse);
    params.set('date', date);
    router.push(`/attendance?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">اختيار الحلقة</label>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر الحلقة</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName} - {course.programName} (المستوى {course.level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">التاريخ</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
