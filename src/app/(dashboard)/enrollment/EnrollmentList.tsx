'use client';

import { useState } from 'react';
import { EnrollmentForm } from './EnrollmentForm';
import type { Program } from '@prisma/client';
import type { CourseWithTeacher } from '@/types';

export function EnrollmentList({ 
  programs,
  initialCourses 
}: { 
  programs: Program[];
  initialCourses: CourseWithTeacher[];
}) {
  const [selectedProgram, setSelectedProgram] = useState(programs[0]?.id);
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithTeacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleProgramChange(programId: string) {
    setSelectedProgram(programId);
    setIsLoading(true);
    
    const response = await fetch(`/api/enrollment/available-courses?programId=${programId}`);
    const data = await response.json();
    
    setCourses(data.courses || []);
    setIsLoading(false);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-bold mb-4">اختر البرنامج</h2>
        <div className="space-y-2">
          {programs.map(program => (
            <button
              key={program.id}
              onClick={() => handleProgramChange(program.id)}
              className={`w-full text-right p-4 rounded-lg border transition ${
                selectedProgram === program.id
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="font-bold">{program.programName}</div>
              <div className="text-sm text-gray-600">{program.programDescription}</div>
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold mt-6 mb-4">الحلقات المتاحة</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد حلقات متاحة</div>
        ) : (
          <div className="space-y-2">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-right p-4 rounded-lg border transition ${
                  selectedCourse?.id === course.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="font-bold">{course.courseName}</div>
                <div className="text-sm text-gray-600">
                  المعلمة: {course.teacher.userName}
                </div>
                <div className="text-sm text-gray-500">
                  {course._count.enrollments} / {course.maxStudents} طالبة
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">إرسال الطلب</h2>
        {selectedCourse ? (
          <div className="bg-white p-6 rounded-lg border">
            <div className="mb-4">
              <h3 className="font-bold text-lg">{selectedCourse.courseName}</h3>
              <p className="text-sm text-gray-600">{selectedCourse.courseDescription}</p>
            </div>
            <EnrollmentForm course={selectedCourse} />
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg border border-dashed text-center text-gray-500">
            اختر حلقة من القائمة لإرسال طلب الانضمام
          </div>
        )}
      </div>
    </div>
  );
}
