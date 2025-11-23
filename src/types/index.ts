import { User, Course, Enrollment, Attendance, Program, Student, DailyGrade, EnrollmentRequest } from '@prisma/client';

export type ActionResponse<T = void> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export type CourseWithTeacher = Course & {
  teacher: Pick<User, 'id' | 'userName' | 'userEmail'>;
  program: Pick<Program, 'id' | 'programName'>;
  _count: { enrollments: number };
};

export type EnrollmentWithDetails = Enrollment & {
  course: CourseWithTeacher;
  student: Pick<Student, 'id' | 'studentName' | 'userId'>;
};

export type EnrollmentFormState = {
  message?: string;
  error?: string;
};

export type AttendanceFormState = {
  message?: string;
  error?: string;
};

export type AttendanceWithStudent = Attendance & {
  student: Pick<Student, 'id' | 'studentName'>;
};

export type DailyGradeWithStudent = DailyGrade & {
  student: Pick<Student, 'id' | 'studentName'>;
};
