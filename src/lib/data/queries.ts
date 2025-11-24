import { cache } from 'react';
import { db } from '@/lib/db';

export const getPrograms = cache(async () => {
  return await db.program.findMany({
    where: { isActive: true },
    orderBy: { programName: 'asc' }
  });
});

export const getCoursesByProgram = cache(async (programId: string) => {
  const courses = await db.course.findMany({
    where: { 
      programId, 
      isActive: true,
      teacher: { isNot: null } // فقط الحلقات التي لها معلمة
    },
    include: {
      teacher: { select: { id: true, userName: true, userEmail: true } },
      program: { select: { id: true, programName: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { courseName: 'asc' }
  });
  
  // تصفية لضمان وجود teacher
  return courses.filter(course => course.teacher !== null) as Array<typeof courses[0] & { teacher: NonNullable<typeof courses[0]['teacher']> }>;
});

export const getTeacherCourses = cache(async (teacherId: string) => {
  return await db.course.findMany({
    where: { teacherId, isActive: true },
    include: {
      program: { select: { id: true, programName: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { courseName: 'asc' }
  });
});

export const getStudentEnrollments = cache(async (studentId: string) => {
  return await db.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          teacher: { select: { id: true, userName: true } },
          program: { select: { id: true, programName: true } }
        }
      }
    },
    orderBy: { enrolledAt: 'desc' }
  });
});

export const getCourseEnrollments = cache(async (courseId: string) => {
  return await db.enrollment.findMany({
    where: { courseId },
    include: {
      student: { select: { id: true, studentName: true, studentNumber: true, userId: true } }
    },
    orderBy: { student: { studentNumber: 'asc' } }
  });
});

export const getEnrollmentRequests = cache(async (courseId?: string) => {
  return await db.enrollmentRequest.findMany({
    where: courseId ? { courseId } : undefined,
    include: {
      course: {
        include: {
          program: { select: { id: true, programName: true } },
          teacher: { select: { id: true, userName: true } }
        }
      },
      student: { select: { id: true, studentName: true, userId: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
});

// ========================
// Grades Queries
// ========================

export const getDailyGrades = cache(async (courseId: string, startDate: string, endDate: string) => {
  return await db.dailyGrade.findMany({
    where: {
      courseId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: {
      student: { select: { id: true, studentName: true, studentNumber: true } }
    },
    orderBy: { date: 'desc' }
  });
});

export const getWeeklyGrades = cache(async (courseId: string) => {
  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: {
      student: { select: { id: true, studentName: true, studentNumber: true } }
    },
    orderBy: { student: { studentNumber: 'asc' } }
  });

  const weeklyGrades = await db.weeklyGrade.findMany({
    where: { courseId },
    orderBy: { week: 'asc' }
  });

  return enrollments.map(enrollment => {
    const grades = weeklyGrades.filter(g => g.studentId === enrollment.studentId);
    return {
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      studentName: enrollment.student.studentName,
      studentNumber: enrollment.student.studentNumber,
      grades: grades.reduce((acc: Record<number, number>, g) => {
        acc[g.week] = Number(g.grade);
        return acc;
      }, {}),
      total: grades.reduce((sum: number, g) => sum + Number(g.grade), 0)
    };
  });
});

export const getMonthlyGrades = cache(async (courseId: string) => {
  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: {
      student: { select: { id: true, studentName: true, studentNumber: true } }
    },
    orderBy: { student: { studentNumber: 'asc' } }
  });

  const monthlyGrades = await db.monthlyGrade.findMany({
    where: { courseId },
    orderBy: { month: 'asc' }
  });

  return enrollments.map(enrollment => {
    const grades = monthlyGrades.filter(g => g.studentId === enrollment.studentId);
    return {
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      studentName: enrollment.student.studentName,
      studentNumber: enrollment.student.studentNumber,
      grades: grades.reduce((acc: Record<number, any>, g) => {
        acc[g.month] = {
          quranForgetfulness: Number(g.quranForgetfulness),
          quranMajorMistakes: Number(g.quranMajorMistakes),
          quranMinorMistakes: Number(g.quranMinorMistakes),
          tajweedTheory: Number(g.tajweedTheory),
          total: Number(g.quranForgetfulness) + Number(g.quranMajorMistakes) + Number(g.quranMinorMistakes) + Number(g.tajweedTheory)
        };
        return acc;
      }, {}),
      total: grades.reduce((sum: number, g) => 
        sum + Number(g.quranForgetfulness) + Number(g.quranMajorMistakes) + Number(g.quranMinorMistakes) + Number(g.tajweedTheory), 0)
    };
  });
});

export const getBehaviorPoints = cache(async (courseId: string, date: string) => {
  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: {
      student: { select: { id: true, studentName: true, studentNumber: true } }
    },
    orderBy: { student: { studentNumber: 'asc' } }
  });

  const points = await db.behaviorPoint.findMany({
    where: {
      courseId,
      date: new Date(date),
    }
  });

  return enrollments.map(enrollment => {
    const studentPoint = points.find(p => p.studentId === enrollment.student.id);
    return {
      studentId: enrollment.student.id,
      studentName: enrollment.student.studentName,
      date,
      earlyAttendance: studentPoint?.earlyAttendance || false,
      perfectMemorization: studentPoint?.perfectMemorization || false,
      activeParticipation: studentPoint?.activeParticipation || false,
      timeCommitment: studentPoint?.timeCommitment || false,
      notes: studentPoint?.notes || ''
    };
  });
});
