'use client';

import { useSession } from 'next-auth/react';
import { useTeacherCourses } from '@/hooks/useCourses';
import { useMyEnrollments } from '@/hooks/useEnrollments';

interface CourseSelectorAsyncProps {
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
}

export default function CourseSelectorAsync({ 
  selectedCourse, 
  onCourseChange 
}: CourseSelectorAsyncProps) {
  const { data: session } = useSession();
  const isStudent = session?.user?.role === 'STUDENT';
  
  const { courses: teacherCourses } = useTeacherCourses(!isStudent);
  const { enrollments } = useMyEnrollments();

  const courses = isStudent
    ? enrollments.map((e: any) => ({
      id: e.id,
      courseName: e.courseName,
      programName: e.programName
    }))
    : teacherCourses;

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          اختر الحلقة:
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => onCourseChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- اختر الحلقة --</option>
          {courses.map((course: any) => (
            <option key={course.id} value={course.id}>
              {course.courseName} {course.programName ? `(${course.programName})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedCourseData && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-md">
          <p className="text-sm text-indigo-700">
            <strong>الحلقة المختارة:</strong> {selectedCourseData.courseName}
          </p>
        </div>
      )}
    </div>
  );
}
