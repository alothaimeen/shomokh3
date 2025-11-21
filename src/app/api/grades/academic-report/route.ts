import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateFinalGrade } from '@/lib/grading-formulas';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    // Authorization: ADMIN and TEACHER only
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId مطلوب' }, { status: 400 });
    }

    // Check course ownership for teachers
    if (session.user.role === 'TEACHER') {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true },
      });

      if (!course || course.teacherId !== session.user.id) {
        return NextResponse.json({ error: 'غير مصرح لهذه الحلقة' }, { status: 403 });
      }
    }

    // ✅ Prisma Select Optimization - جلب الحقول المطلوبة فقط
    const enrollments = await db.enrollment.findMany({
      where: { courseId },
      select: {
        id: true,
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
            dailyGrades: {
              where: { courseId },
              select: {
                memorization: true,
                review: true,
              }
            },
            weeklyGrades: {
              where: { courseId },
              select: {
                grade: true,
              }
            },
            monthlyGrades: {
              where: { courseId },
              select: {
                quranForgetfulness: true,
                quranMajorMistakes: true,
                quranMinorMistakes: true,
                tajweedTheory: true,
              }
            },
            behaviorGrades: {
              where: { courseId },
              select: {
                dailyScore: true,
              }
            },
            finalExams: {
              where: { courseId },
              select: {
                quranTest: true,
                tajweedTest: true,
              }
            },
          },
        },
      },
    });

    // Calculate final grades for each student
    const reports = enrollments.map((enrollment) => {
      // Calculate raw totals
      const dailyRaw = enrollment.student.dailyGrades.reduce(
        (sum: number, grade) => sum + (grade.memorization?.toNumber() || 0) + (grade.review?.toNumber() || 0),
        0
      );

      const weeklyRaw = enrollment.student.weeklyGrades.reduce(
        (sum: number, grade) => sum + (grade.grade?.toNumber() || 0),
        0
      );

      const monthlyRaw = enrollment.student.monthlyGrades.reduce(
        (sum: number, grade) => sum + (grade.quranForgetfulness?.toNumber() || 0) + (grade.quranMajorMistakes?.toNumber() || 0) + (grade.quranMinorMistakes?.toNumber() || 0) + (grade.tajweedTheory?.toNumber() || 0),
        0
      );

      const behaviorRaw = enrollment.student.behaviorGrades.reduce(
        (sum: number, grade) => sum + (grade.dailyScore?.toNumber() || 0),
        0
      );

      const finalExamRaw = enrollment.student.finalExams.length > 0
        ? (enrollment.student.finalExams[0].quranTest?.toNumber() || 0) + (enrollment.student.finalExams[0].tajweedTest?.toNumber() || 0)
        : 0;

      // Calculate final grades using formulas
      const finalGrades = calculateFinalGrade({
        dailyRaw,
        weeklyRaw,
        monthlyRaw,
        behaviorRaw,
        finalExamRaw,
      });

      return {
        studentId: enrollment.student.studentNumber,
        studentName: enrollment.student.studentName,
        grades: {
          dailyRaw,
          weeklyRaw,
          monthlyRaw,
          behaviorRaw,
          finalExamRaw,
          ...finalGrades,
        },
      };
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching academic reports:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التقارير' },
      { status: 500 }
    );
  }
}
