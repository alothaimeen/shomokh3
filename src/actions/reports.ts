'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// ==================== TYPES ====================

export type SortField = 'date' | 'studentName' | 'studentNumber' | 'courseName' | 'status' | 'points' | 'total';
export type SortOrder = 'asc' | 'desc';
export type ExportFormat = 'summary' | 'detailed';
export type AttendanceViewMode = 'by-student' | 'by-date';

export interface ReportFilters {
  courseId?: string;
  programId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export interface ExportOptions {
  format: ExportFormat;
  filters?: ReportFilters;
  sortBy?: SortOptions;
}

// ==================== ATTENDANCE REPORT ====================

export interface AttendanceReportItem {
  id: string;
  date: string;
  studentId: string;
  studentNumber: number;
  studentName: string;
  courseId: string;
  courseName: string;
  programName: string;
  status: string;
  statusLabel: string;
}

export interface AttendanceReportByDate {
  date: string;
  records: Array<{
    studentNumber: number;
    studentName: string;
    courseName: string;
    status: string;
    statusLabel: string;
  }>;
  stats: {
    present: number;
    excused: number;
    absent: number;
    reviewed: number;
    leftEarly: number;
    total: number;
  };
}

export async function getAttendanceReportData(
  filters?: ReportFilters,
  sortBy?: SortOptions,
  viewMode: AttendanceViewMode = 'by-student'
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'غير مصرح' };
  }

  try {
    // بناء WHERE clause
    const whereClause: Prisma.AttendanceWhereInput = {};

    // TEACHER يرى حلقاته فقط
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      whereClause.courseId = { in: teacherCourses.map(c => c.id) };
    }

    // تطبيق الفلاتر
    if (filters?.courseId) {
      whereClause.courseId = filters.courseId;
    }
    if (filters?.studentId) {
      whereClause.studentId = filters.studentId;
    }
    if (filters?.status) {
      whereClause.status = filters.status as any;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.date = {};
      if (filters.dateFrom) {
        whereClause.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereClause.date.lte = new Date(filters.dateTo);
      }
    }

    // جلب البيانات
    const records = await db.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            studentName: true
          }
        },
        course: {
          select: {
            id: true,
            courseName: true,
            program: {
              select: { programName: true }
            }
          }
        }
      }
    });

    // تحويل البيانات حسب View Mode
    if (viewMode === 'by-date') {
      // تجميع حسب التاريخ
      const dateMap = new Map<string, AttendanceReportByDate>();

      records.forEach(record => {
        const dateKey = record.date.toISOString().split('T')[0];

        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            date: dateKey,
            records: [],
            stats: {
              present: 0,
              excused: 0,
              absent: 0,
              reviewed: 0,
              leftEarly: 0,
              total: 0
            }
          });
        }

        const dateGroup = dateMap.get(dateKey)!;
        dateGroup.records.push({
          studentNumber: record.student.studentNumber,
          studentName: record.student.studentName,
          courseName: record.course.courseName,
          status: record.status,
          statusLabel: getAttendanceStatusLabel(record.status)
        });

        // تحديث الإحصائيات
        dateGroup.stats.total++;
        switch (record.status) {
          case 'PRESENT':
            dateGroup.stats.present++;
            break;
          case 'EXCUSED':
            dateGroup.stats.excused++;
            break;
          case 'ABSENT':
            dateGroup.stats.absent++;
            break;
          case 'REVIEWED':
            dateGroup.stats.reviewed++;
            break;
          case 'LEFT_EARLY':
            dateGroup.stats.leftEarly++;
            break;
        }
      });

      const byDateData = Array.from(dateMap.values()).sort((a, b) =>
        sortBy?.order === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return { success: true, data: byDateData, viewMode: 'by-date' as const };
    }

    // by-student (default)
    const report: AttendanceReportItem[] = records.map(record => ({
      id: record.id,
      date: record.date.toISOString().split('T')[0],
      studentId: record.student.id,
      studentNumber: record.student.studentNumber,
      studentName: record.student.studentName,
      courseId: record.course.id,
      courseName: record.course.courseName,
      programName: record.course.program.programName,
      status: record.status,
      statusLabel: getAttendanceStatusLabel(record.status)
    }));

    // الترتيب
    const sortedReport = applySorting(report, sortBy);

    return { success: true, data: sortedReport, viewMode: 'by-student' as const };
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    return { error: 'حدث خطأ أثناء جلب تقرير الحضور' };
  }
}

// ==================== BEHAVIOR POINTS REPORT ====================

export interface BehaviorPointsReportItem {
  studentId: string;
  studentNumber: number;
  studentName: string;
  courseId: string;
  courseName: string;
  totalPoints: number;
  earlyAttendancePoints: number;
  perfectMemorizationPoints: number;
  activeParticipationPoints: number;
  timeCommitmentPoints: number;
  recordsCount: number;
  averagePerSession: number;
}

export async function getBehaviorPointsReportData(
  filters?: ReportFilters,
  sortBy?: SortOptions
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'غير مصرح' };
  }

  try {
    const whereClause: Prisma.BehaviorPointWhereInput = {};

    // TEACHER يرى حلقاته فقط
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      whereClause.courseId = { in: teacherCourses.map(c => c.id) };
    }

    // تطبيق الفلاتر
    if (filters?.courseId) {
      whereClause.courseId = filters.courseId;
    }
    if (filters?.studentId) {
      whereClause.studentId = filters.studentId;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.date = {};
      if (filters.dateFrom) {
        whereClause.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereClause.date.lte = new Date(filters.dateTo);
      }
    }

    const behaviorRecords = await db.behaviorPoint.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            studentName: true
          }
        },
        course: {
          select: {
            id: true,
            courseName: true
          }
        }
      }
    });

    // تجميع النقاط لكل طالبة
    const studentsMap = new Map<string, BehaviorPointsReportItem>();

    behaviorRecords.forEach(record => {
      const key = `${record.studentId}-${record.courseId}`;

      const earlyAttendancePoints = record.earlyAttendance ? 5 : 0;
      const perfectMemorizationPoints = record.perfectMemorization ? 5 : 0;
      const activeParticipationPoints = record.activeParticipation ? 5 : 0;
      const timeCommitmentPoints = record.timeCommitment ? 5 : 0;

      const sessionPoints =
        earlyAttendancePoints +
        perfectMemorizationPoints +
        activeParticipationPoints +
        timeCommitmentPoints;

      const existing = studentsMap.get(key);

      if (existing) {
        existing.totalPoints += sessionPoints;
        existing.earlyAttendancePoints += earlyAttendancePoints;
        existing.perfectMemorizationPoints += perfectMemorizationPoints;
        existing.activeParticipationPoints += activeParticipationPoints;
        existing.timeCommitmentPoints += timeCommitmentPoints;
        existing.recordsCount++;
        existing.averagePerSession = Math.round(existing.totalPoints / existing.recordsCount);      } else {
        studentsMap.set(key, {
          studentId: record.student.id,
          studentNumber: record.student.studentNumber,
          studentName: record.student.studentName,
          courseId: record.course.id,
          courseName: record.course.courseName,
          totalPoints: sessionPoints,
          earlyAttendancePoints,
          perfectMemorizationPoints,
          activeParticipationPoints,
          timeCommitmentPoints,
          recordsCount: 1,
          averagePerSession: sessionPoints
        });
      }
    });

    const report = Array.from(studentsMap.values());

    // الترتيب (الافتراضي: حسب النقاط تنازلياً)
    const defaultSort: SortOptions = { field: 'points', order: 'desc' };
    const sortedReport = applySorting(report, sortBy || defaultSort);

    return { success: true, data: sortedReport };
  } catch (error) {
    console.error('Error fetching behavior points report:', error);
    return { error: 'حدث خطأ أثناء جلب تقرير النقاط التحفيزية' };
  }
}

// ==================== ACADEMIC REPORT ====================

export interface AcademicReportItem {
  studentId: string;
  studentNumber: number;
  studentName: string;
  courseId: string;
  courseName: string;
  // الدرجات اليومية
  dailyGrades: {
    recitation: number | null;
    review: number | null;
    homework: number | null;
    participation: number | null;
    total: number;
    count: number;
    average: number;
  };
  // الدرجات الأسبوعية
  weeklyGrades: {
    total: number;
    count: number;
    average: number;
  };
  // الدرجات الشهرية
  monthlyGrades: {
    total: number;
    count: number;
    average: number;
  };
  // الدرجات السلوكية
  behaviorGrades: {
    total: number;
    count: number;
    average: number;
  };
  // الإجمالي
  overallTotal: number;
  overallAverage: number;
  percentage: number;
  status: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف';
}

export async function getAcademicReportData(
  filters?: ReportFilters,
  sortBy?: SortOptions
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'غير مصرح' };
  }

  try {
    const whereClause: any = {};

    // TEACHER يرى حلقاته فقط
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      whereClause.courseId = { in: teacherCourses.map(c => c.id) };
    }

    // تطبيق الفلاتر
    if (filters?.courseId) {
      whereClause.courseId = filters.courseId;
    }
    if (filters?.studentId) {
      whereClause.studentId = filters.studentId;
    }

    // جلب جميع الدرجات
    const [dailyGrades, weeklyGrades, monthlyGrades, behaviorPoints] = await Promise.all([
      db.dailyGrade.findMany({
        where: whereClause,
        include: {
          student: { select: { id: true, studentNumber: true, studentName: true } },
          course: { select: { id: true, courseName: true } }
        }
      }),
      db.weeklyGrade.findMany({
        where: whereClause,
        include: {
          student: { select: { id: true, studentNumber: true, studentName: true } },
          course: { select: { id: true, courseName: true } }
        }
      }),
      db.monthlyGrade.findMany({
        where: whereClause,
        include: {
          student: { select: { id: true, studentNumber: true, studentName: true } },
          course: { select: { id: true, courseName: true } }
        }
      }),
      // نقرأ من BehaviorPoint بدلاً من BehaviorGrade
      db.behaviorPoint.findMany({
        where: whereClause,
        include: {
          student: { select: { id: true, studentNumber: true, studentName: true } },
          course: { select: { id: true, courseName: true } }
        }
      })
    ]);

    // تجميع البيانات
    const studentsMap = new Map<string, AcademicReportItem>();

    // معالجة الدرجات اليومية
    dailyGrades.forEach(grade => {
      const key = `${grade.studentId}-${grade.courseId}`;

      if (!studentsMap.has(key)) {
        studentsMap.set(key, {
          studentId: grade.student.id,
          studentNumber: grade.student.studentNumber,
          studentName: grade.student.studentName,
          courseId: grade.course.id,
          courseName: grade.course.courseName,
          dailyGrades: {
            recitation: 0,
            review: 0,
            homework: 0,
            participation: 0,
            total: 0,
            count: 0,
            average: 0
          },
          weeklyGrades: { total: 0, count: 0, average: 0 },
          monthlyGrades: { total: 0, count: 0, average: 0 },
          behaviorGrades: { total: 0, count: 0, average: 0 },
          overallTotal: 0,
          overallAverage: 0,
          percentage: 0,
          status: 'مقبول'
        });
      }

      const item = studentsMap.get(key)!;
      const dailyTotal =
        Number(grade.memorization || 0) +
        Number(grade.review || 0) +
        (0 || 0) +
        (0 || 0);

      item.dailyGrades.total += dailyTotal;
      item.dailyGrades.count++;
      item.dailyGrades.recitation = (item.dailyGrades.recitation || 0) + Number(grade.memorization || 0);
      item.dailyGrades.review = (item.dailyGrades.review || 0) + Number(grade.review || 0);
      item.dailyGrades.homework = (item.dailyGrades.homework || 0) + (0 || 0);
      item.dailyGrades.participation = (item.dailyGrades.participation || 0) + (0 || 0);
    });

    // معالجة الدرجات الأسبوعية
    weeklyGrades.forEach(grade => {
      const key = `${grade.studentId}-${grade.courseId}`;
      const item = studentsMap.get(key);
      if (item) {
        item.weeklyGrades.total += Number(grade.grade) || 0;
        item.weeklyGrades.count++;
      }
    });

    // معالجة الدرجات الشهرية
    monthlyGrades.forEach(grade => {
      const key = `${grade.studentId}-${grade.courseId}`;
      const item = studentsMap.get(key);
      if (item) {
        item.monthlyGrades.total += (Number(grade.quranForgetfulness) + Number(grade.quranMajorMistakes) + Number(grade.quranMinorMistakes) + Number(grade.tajweedTheory)) || 0;
        item.monthlyGrades.count++;
      }
    });

    // معالجة الدرجات السلوكية (من BehaviorPoint)
    behaviorPoints.forEach(point => {
      const key = `${point.studentId}-${point.courseId}`;
      const item = studentsMap.get(key);
      if (item) {
        // كل معيار = 5 نقاط (max 20 per session)
        const sessionPoints = 
          (point.earlyAttendance ? 5 : 0) +
          (point.perfectMemorization ? 5 : 0) +
          (point.activeParticipation ? 5 : 0) +
          (point.timeCommitment ? 5 : 0);
        item.behaviorGrades.total += sessionPoints;
        item.behaviorGrades.count++;
      }
    });

    // حساب المعدلات والنسب المئوية
    // نظام الدرجات:
    // - اليومية: memorization (0-5) + review (0-5) = max 10 per day
    // - الأسبوعية: grade (0-5) = max 5 per week, 10 weeks = max 50
    // - الشهرية: quranForgetfulness(0-5) + quranMajorMistakes(0-5) + quranMinorMistakes(0-5) + tajweedTheory(0-15) = max 30 per month, 3 months = max 90
    // - السلوك: max 20 per session (4 × 5 points)
    
    const report = Array.from(studentsMap.values()).map(item => {
      // حساب المعدلات (متوسط الدرجة لكل وحدة)
      item.dailyGrades.average = item.dailyGrades.count > 0
        ? parseFloat((item.dailyGrades.total / item.dailyGrades.count).toFixed(2))
        : 0;

      item.weeklyGrades.average = item.weeklyGrades.count > 0
        ? parseFloat((item.weeklyGrades.total / item.weeklyGrades.count).toFixed(2))
        : 0;

      item.monthlyGrades.average = item.monthlyGrades.count > 0
        ? parseFloat((item.monthlyGrades.total / item.monthlyGrades.count).toFixed(2))
        : 0;

      item.behaviorGrades.average = item.behaviorGrades.count > 0
        ? parseFloat((item.behaviorGrades.total / item.behaviorGrades.count).toFixed(2))
        : 0;

      // الإجمالي (مجموع كل الدرجات)
      item.overallTotal = parseFloat((
        item.dailyGrades.total +
        item.weeklyGrades.total +
        item.monthlyGrades.total +
        item.behaviorGrades.total
      ).toFixed(2));

      // حساب الدرجة القصوى الممكنة
      const maxDaily = item.dailyGrades.count * 10; // max 10 per day
      const maxWeekly = item.weeklyGrades.count * 5; // max 5 per week
      const maxMonthly = item.monthlyGrades.count * 30; // max 30 per month
      const maxBehavior = item.behaviorGrades.count * 20; // max 20 per session
      const maxPossible = maxDaily + maxWeekly + maxMonthly + maxBehavior;

      item.overallAverage = maxPossible > 0
        ? parseFloat((item.overallTotal / maxPossible * 100).toFixed(2))
        : 0;

      // النسبة المئوية
      item.percentage = Math.min(100, Math.round(item.overallAverage));

      // الحالة
      if (item.percentage >= 90) item.status = 'ممتاز';
      else if (item.percentage >= 80) item.status = 'جيد جداً';
      else if (item.percentage >= 70) item.status = 'جيد';
      else if (item.percentage >= 60) item.status = 'مقبول';
      else item.status = 'ضعيف';

      return item;
    });

    // الترتيب (الافتراضي: حسب الإجمالي تنازلياً)
    const defaultSort: SortOptions = { field: 'total', order: 'desc' };
    const sortedReport = applySorting(report, sortBy || defaultSort);

    return { success: true, data: sortedReport };
  } catch (error) {
    console.error('Error fetching academic report:', error);
    return { error: 'حدث خطأ أثناء جلب التقرير الأكاديمي' };
  }
}

// ==================== DASHBOARD STATS ====================

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'غير مصرح' };
  }

  try {
    const role = session.user.role;

    if (role === 'ADMIN') {
      const [
        totalStudents,
        totalTeachers,
        totalCourses,
        activeEnrollments,
        recentAttendance
      ] = await Promise.all([
        db.student.count(),
        db.user.count({ where: { userRole: 'TEACHER' } }),
        db.course.count(),
        db.enrollment.count({ where: { isActive: true } }),
        db.attendance.count({
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
          }
        })
      ]);

      // أفضل 5 طالبات
      const pointsResult = await getBehaviorPointsReportData();
      const topStudents = pointsResult.success && Array.isArray(pointsResult.data)
        ? pointsResult.data.slice(0, 5).map(s => ({
            studentName: s.studentName,
            studentNumber: s.studentNumber,
            points: s.totalPoints
          }))
        : [];

      return {
        success: true,
        data: {
          totalStudents,
          totalTeachers,
          totalCourses,
          activeEnrollments,
          recentAttendance,
          topStudents
        }
      };
    }

    if (role === 'TEACHER') {
      const courses = await db.course.findMany({
        where: { teacherId: session.user.id },
        include: {
          _count: {
            select: {
              enrollments: true,
              attendances: true
            }
          }
        }
      });

      const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
      const totalAttendance = courses.reduce((sum, c) => sum + c._count.attendances, 0);

      return {
        success: true,
        data: {
          totalCourses: courses.length,
          totalStudents,
          totalAttendance,
          courses: courses.map(c => ({
            id: c.id,
            courseName: c.courseName,
            studentsCount: c._count.enrollments,
            attendanceCount: c._count.attendances
          }))
        }
      };
    }

    if (role === 'STUDENT') {
      const student = await db.student.findUnique({
        where: { userId: session.user.id },
        include: {
          enrollments: {
            include: {
              course: { select: { courseName: true } }
            }
          },
          attendances: { where: { status: 'PRESENT' } },
          behaviorPoints: true
        }
      });

      if (!student) {
        return { error: 'لم يتم العثور على بيانات الطالبة' };
      }

      const totalPoints = student.behaviorPoints.reduce((sum, p) => {
        const points =
          (p.earlyAttendance ? 5 : 0) +
          (p.perfectMemorization ? 5 : 0) +
          (p.activeParticipation ? 5 : 0) +
          (p.timeCommitment ? 5 : 0);
        return sum + points;
      }, 0);

      const totalAttendanceRecords = await db.attendance.count({
        where: { studentId: student.id }
      });

      const attendanceRate = totalAttendanceRecords > 0
        ? Math.round((student.attendances.length / totalAttendanceRecords) * 100)
        : 0;

      return {
        success: true,
        data: {
          totalCourses: student.enrollments.length,
          totalAttendance: student.attendances.length,
          totalPoints,
          attendanceRate,
          courses: student.enrollments.map(e => e.course.courseName)
        }
      };
    }

    return { error: 'دور غير معروف' };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { error: 'حدث خطأ أثناء جلب الإحصائيات' };
  }
}

// ==================== HELPER FUNCTIONS ====================

function getAttendanceStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    PRESENT: 'حاضرة',
    EXCUSED: 'غائبة بعذر',
    ABSENT: 'غائبة بدون عذر',
    REVIEWED: 'راجعت بدون حضور',
    LEFT_EARLY: 'خروج مبكر'
  };
  return labels[status] || status;
}

function applySorting<T extends Record<string, any>>(
  data: T[],
  sortBy?: SortOptions
): T[] {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    // تحديد القيم للمقارنة
    switch (sortBy.field) {
      case 'studentName':
        aValue = a.studentName;
        bValue = b.studentName;
        break;
      case 'studentNumber':
        aValue = a.studentNumber;
        bValue = b.studentNumber;
        break;
      case 'courseName':
        aValue = a.courseName;
        bValue = b.courseName;
        break;
      case 'date':
        aValue = a.date;
        bValue = b.date;
        break;
      case 'status':
        aValue = a.status || a.statusLabel;
        bValue = b.status || b.statusLabel;
        break;
      case 'points':
        aValue = a.totalPoints || 0;
        bValue = b.totalPoints || 0;
        break;
      case 'total':
        aValue = a.overallTotal || a.totalPoints || 0;
        bValue = b.overallTotal || b.totalPoints || 0;
        break;
      default:
        return 0;
    }

    // المقارنة
    if (aValue === bValue) return 0;

    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'ar');
      return sortBy.order === 'asc' ? comparison : -comparison;
    }

    const comparison = aValue < bValue ? -1 : 1;
    return sortBy.order === 'asc' ? comparison : -comparison;
  });
}



