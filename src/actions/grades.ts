'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ========================
// Daily Grades Actions
// ========================

export async function saveDailyGrades(formData: FormData) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }

  const courseId = formData.get('courseId') as string;
  const gradesJson = formData.get('grades') as string;
  
  if (!courseId || !gradesJson) {
    return { success: false, error: 'بيانات ناقصة' };
  }

  try {
    const grades = JSON.parse(gradesJson);

    for (const grade of grades) {
      await db.dailyGrade.upsert({
        where: {
          studentId_courseId_date: {
            studentId: grade.studentId,
            courseId,
            date: new Date(grade.date),
          },
        },
        update: {
          memorization: grade.memorization,
          review: grade.review,
          notes: grade.notes || null,
        },
        create: {
          studentId: grade.studentId,
          courseId,
          date: new Date(grade.date),
          memorization: grade.memorization,
          review: grade.review,
          notes: grade.notes || null,
        },
      });
    }

    revalidatePath('/daily-grades');
    revalidatePath('/unified-assessment');
    return { success: true, message: `تم حفظ ${grades.length} درجة` };
  } catch (error) {
    console.error('Error saving daily grades:', error);
    return { success: false, error: 'فشل الحفظ' };
  }
}

// ========================
// Weekly Grades Actions
// ========================

export async function saveWeeklyGrade(formData: FormData) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }

  const enrollmentId = formData.get('enrollmentId') as string;
  const week = parseInt(formData.get('week') as string);
  const grade = parseFloat(formData.get('grade') as string);

  if (!enrollmentId || !week || isNaN(grade)) {
    return { success: false, error: 'بيانات ناقصة' };
  }

  try {
    // Get enrollment to find studentId and courseId
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { studentId: true, courseId: true }
    });

    if (!enrollment) {
      return { success: false, error: 'التسجيل غير موجود' };
    }

    await db.weeklyGrade.upsert({
      where: {
        studentId_courseId_week: {
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          week
        },
      },
      update: { grade },
      create: {
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        week,
        grade
      },
    });

    revalidatePath('/weekly-grades');
    revalidatePath('/unified-assessment');
    return { success: true };
  } catch (error) {
    console.error('Error saving weekly grade:', error);
    return { success: false, error: 'فشل الحفظ' };
  }
}

// ========================
// Monthly Grades Actions
// ========================

export async function saveMonthlyGrade(formData: FormData) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }

  const enrollmentId = formData.get('enrollmentId') as string;
  const month = parseInt(formData.get('month') as string);
  const quranForgetfulness = parseFloat(formData.get('quranForgetfulness') as string);
  const quranMajorMistakes = parseFloat(formData.get('quranMajorMistakes') as string);
  const quranMinorMistakes = parseFloat(formData.get('quranMinorMistakes') as string);
  const tajweedTheory = parseFloat(formData.get('tajweedTheory') as string);

  if (!enrollmentId || !month) {
    return { success: false, error: 'بيانات ناقصة' };
  }

  try {
    // Get enrollment to find studentId and courseId
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { studentId: true, courseId: true }
    });

    if (!enrollment) {
      return { success: false, error: 'التسجيل غير موجود' };
    }

    await db.monthlyGrade.upsert({
      where: {
        studentId_courseId_month: {
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          month
        },
      },
      update: {
        quranForgetfulness,
        quranMajorMistakes,
        quranMinorMistakes,
        tajweedTheory,
      },
      create: {
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        month,
        quranForgetfulness,
        quranMajorMistakes,
        quranMinorMistakes,
        tajweedTheory,
      },
    });

    revalidatePath('/monthly-grades');
    revalidatePath('/unified-assessment');
    return { success: true };
  } catch (error) {
    console.error('Error saving monthly grade:', error);
    return { success: false, error: 'فشل الحفظ' };
  }
}

// ========================
// Behavior Points Actions
// ========================

export async function saveBehaviorPoints(formData: FormData) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }

  const courseId = formData.get('courseId') as string;
  const pointsJson = formData.get('points') as string;

  if (!courseId || !pointsJson) {
    return { success: false, error: 'بيانات ناقصة' };
  }

  try {
    const points = JSON.parse(pointsJson);

    for (const point of points) {
      await db.behaviorPoint.upsert({
        where: {
          studentId_courseId_date: {
            studentId: point.studentId,
            courseId,
            date: new Date(point.date),
          },
        },
        update: {
          earlyAttendance: point.earlyAttendance,
          perfectMemorization: point.perfectMemorization,
          activeParticipation: point.activeParticipation,
          timeCommitment: point.timeCommitment,
          notes: point.notes || null,
        },
        create: {
          studentId: point.studentId,
          courseId,
          date: new Date(point.date),
          earlyAttendance: point.earlyAttendance,
          perfectMemorization: point.perfectMemorization,
          activeParticipation: point.activeParticipation,
          timeCommitment: point.timeCommitment,
          notes: point.notes || null,
        },
      });
    }

    revalidatePath('/behavior-points');
    revalidatePath('/unified-assessment');
    return { success: true, message: `تم حفظ نقاط ${points.length} طالبة` };
  } catch (error) {
    console.error('Error saving behavior points:', error);
    return { success: false, error: 'فشل الحفظ' };
  }
}

// ========================
// Final Exam Actions
// ========================

export async function saveFinalExamGrades(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }

  const courseId = formData.get('courseId') as string;
  const gradesJson = formData.get('grades') as string;
  
  if (!courseId || !gradesJson) {
    return { success: false, error: 'بيانات ناقصة' };
  }

  try {
    const grades = JSON.parse(gradesJson);

    for (const grade of grades) {
      const existing = await db.finalExam.findFirst({
        where: {
          studentId: grade.studentId,
          courseId
        }
      });

      if (existing) {
        await db.finalExam.update({
          where: { id: existing.id },
          data: {
            quranTest: grade.quranTest,
            tajweedTest: grade.tajweedTest,
            notes: grade.notes || null
          }
        });
      } else {
        await db.finalExam.create({
          data: {
            studentId: grade.studentId,
            courseId,
            quranTest: grade.quranTest,
            tajweedTest: grade.tajweedTest,
            notes: grade.notes || null
          }
        });
      }
    }

    revalidatePath('/final-exam');
    return { success: true, message: `تم حفظ درجات ${grades.length} طالبة` };
  } catch (error) {
    console.error('Error saving final exam grades:', error);
    return { success: false, error: 'فشل الحفظ' };
  }
}

// ========================
// Behavior Grades Actions
// ========================

export async function saveBehaviorGrades(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }

  const courseId = formData.get('courseId') as string;
  const date = formData.get('date') as string;
  const gradesJson = formData.get('grades') as string;
  
  if (!courseId || !date || !gradesJson) {
    return { success: false, error: 'بيانات ناقصة' };
  }

  try {
    const grades = JSON.parse(gradesJson);

    for (const grade of grades) {
      const existing = await db.behaviorGrade.findFirst({
        where: {
          studentId: grade.studentId,
          courseId,
          date: new Date(date)
        }
      });

      if (existing) {
        await db.behaviorGrade.update({
          where: { id: existing.id },
          data: {
            dailyScore: grade.dailyScore,
            notes: grade.notes || null
          }
        });
      } else {
        await db.behaviorGrade.create({
          data: {
            studentId: grade.studentId,
            courseId,
            date: new Date(date),
            dailyScore: grade.dailyScore,
            notes: grade.notes || null
          }
        });
      }
    }

    revalidatePath('/behavior-grades');
    return { success: true, message: `تم حفظ درجات ${grades.length} طالبة` };
  } catch (error) {
    console.error('Error saving behavior grades:', error);
    return { success: false, error: 'فشل الحفظ' };
  }
}
