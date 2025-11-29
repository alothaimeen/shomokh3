'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// ==================== TYPES ====================

export interface PerformanceTrendItem {
  week: string;
  weekLabel: string;
  average: number;
  count: number;
}

export interface PerformanceDistributionItem {
  level: string;
  levelLabel: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CourseComparisonItem {
  courseId: string;
  courseName: string;
  average: number;
  studentCount: number;
}

export interface StudentProgressItem {
  date: string;
  dateLabel: string;
  score: number;
  courseAverage: number;
}

export interface GradesDistributionItem {
  range: string;
  rangeLabel: string;
  count: number;
  percentage: number;
}

// ==================== PERFORMANCE TREND ====================

/**
 * جلب اتجاهات الأداء الأسبوعية
 * للمديرة: جميع الطالبات
 * للمعلمة: طالبات حلقاتها
 * للطالبة: بياناتها الشخصية
 */
export async function getPerformanceTrend(filters?: {
  courseId?: string;
  weeks?: number;
}): Promise<{ success: boolean; data?: PerformanceTrendItem[]; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const weeksCount = filters?.weeks || 10;
    
    // بناء WHERE clause بناءً على الدور
    let courseIds: string[] = [];
    
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      courseIds = teacherCourses.map(c => c.id);
    } else if (session.user.role === 'STUDENT') {
      const studentEnrollments = await db.enrollment.findMany({
        where: { 
          student: { userId: session.user.id },
          isActive: true 
        },
        select: { courseId: true }
      });
      courseIds = studentEnrollments.map(e => e.courseId);
    }

    // فلتر الحلقة إذا تم تحديدها
    if (filters?.courseId) {
      // تحقق من الملكية
      if (session.user.role === 'TEACHER' && !courseIds.includes(filters.courseId)) {
        return { success: false, error: 'غير مصرح بالوصول لهذه الحلقة' };
      }
      courseIds = [filters.courseId];
    }

    // جلب الدرجات الأسبوعية
    const weeklyGrades = await db.weeklyGrade.findMany({
      where: {
        ...(courseIds.length > 0 && { courseId: { in: courseIds } }),
        week: { lte: weeksCount }
      },
      select: {
        week: true,
        grade: true
      }
    });

    // تجميع حسب الأسبوع
    const weekMap = new Map<number, { total: number; count: number }>();
    
    weeklyGrades.forEach(grade => {
      const current = weekMap.get(grade.week) || { total: 0, count: 0 };
      current.total += Number(grade.grade);
      current.count++;
      weekMap.set(grade.week, current);
    });

    // تحويل لمصفوفة مرتبة
    const result: PerformanceTrendItem[] = [];
    for (let w = 1; w <= weeksCount; w++) {
      const data = weekMap.get(w);
      if (data && data.count > 0) {
        result.push({
          week: `w${w}`,
          weekLabel: `الأسبوع ${w}`,
          average: Number((data.total / data.count).toFixed(2)),
          count: data.count
        });
      }
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching performance trend:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
}

// ==================== PERFORMANCE DISTRIBUTION ====================

/**
 * جلب توزيع الطالبات حسب مستويات الأداء
 * مستويات: ممتاز (90%+), جيد جداً (75-89%), جيد (60-74%), يحتاج تحسين (<60%)
 */
export async function getPerformanceDistribution(filters?: {
  courseId?: string;
}): Promise<{ success: boolean; data?: PerformanceDistributionItem[]; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    let courseIds: string[] = [];
    
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      courseIds = teacherCourses.map(c => c.id);
    }

    if (filters?.courseId) {
      if (session.user.role === 'TEACHER' && !courseIds.includes(filters.courseId)) {
        return { success: false, error: 'غير مصرح بالوصول لهذه الحلقة' };
      }
      courseIds = [filters.courseId];
    }

    // جلب جميع الدرجات الأسبوعية (max 5 per week)
    const weeklyGrades = await db.weeklyGrade.groupBy({
      by: ['studentId'],
      where: {
        ...(courseIds.length > 0 && { courseId: { in: courseIds } })
      },
      _avg: {
        grade: true
      }
    });

    // حساب التوزيع (النسبة من 5 = 100%)
    const distribution = {
      excellent: 0,  // 90%+ (4.5+)
      veryGood: 0,   // 75-89% (3.75-4.49)
      good: 0,       // 60-74% (3.0-3.74)
      needsImprovement: 0  // <60% (<3.0)
    };

    weeklyGrades.forEach(student => {
      const avg = Number(student._avg.grade || 0);
      if (avg >= 4.5) distribution.excellent++;
      else if (avg >= 3.75) distribution.veryGood++;
      else if (avg >= 3.0) distribution.good++;
      else distribution.needsImprovement++;
    });

    const total = weeklyGrades.length || 1;

    const result: PerformanceDistributionItem[] = [
      {
        level: 'excellent',
        levelLabel: 'ممتاز',
        count: distribution.excellent,
        percentage: Number(((distribution.excellent / total) * 100).toFixed(1)),
        color: '#22c55e' // green-500
      },
      {
        level: 'veryGood',
        levelLabel: 'جيد جداً',
        count: distribution.veryGood,
        percentage: Number(((distribution.veryGood / total) * 100).toFixed(1)),
        color: '#3b82f6' // blue-500
      },
      {
        level: 'good',
        levelLabel: 'جيد',
        count: distribution.good,
        percentage: Number(((distribution.good / total) * 100).toFixed(1)),
        color: '#eab308' // yellow-500
      },
      {
        level: 'needsImprovement',
        levelLabel: 'يحتاج تحسين',
        count: distribution.needsImprovement,
        percentage: Number(((distribution.needsImprovement / total) * 100).toFixed(1)),
        color: '#ef4444' // red-500
      }
    ];

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching performance distribution:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
}

// ==================== COURSE COMPARISON ====================

/**
 * مقارنة متوسط الدرجات بين الحلقات
 * للمديرة فقط
 */
export async function getCourseComparison(): Promise<{ 
  success: boolean; 
  data?: CourseComparisonItem[]; 
  error?: string 
}> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'غير مصرح' };
  }

  // فقط المديرة يمكنها رؤية مقارنة جميع الحلقات
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: 'هذه الميزة متاحة للمديرة فقط' };
  }

  try {
    // جلب جميع الحلقات مع متوسط الدرجات
    const courses = await db.course.findMany({
      where: { isActive: true },
      select: {
        id: true,
        courseName: true,
        weeklyGrades: {
          select: { grade: true }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });

    const result: CourseComparisonItem[] = courses.map(course => {
      const totalGrades = course.weeklyGrades.reduce((sum, g) => sum + Number(g.grade), 0);
      const avgGrade = course.weeklyGrades.length > 0 
        ? totalGrades / course.weeklyGrades.length 
        : 0;
      
      return {
        courseId: course.id,
        courseName: course.courseName,
        average: Number(avgGrade.toFixed(2)),
        studentCount: course._count.enrollments
      };
    }).sort((a, b) => b.average - a.average); // ترتيب تنازلي

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching course comparison:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
}

// ==================== STUDENT PROGRESS ====================

/**
 * جلب تقدم طالبة معينة عبر الوقت مع مقارنة بمتوسط الحلقة
 */
export async function getStudentProgress(studentId?: string): Promise<{ 
  success: boolean; 
  data?: StudentProgressItem[]; 
  error?: string 
}> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    let targetStudentId = studentId;

    // إذا كان المستخدم طالبة، استخدم ID الطالبة المرتبطة بها
    if (session.user.role === 'STUDENT') {
      const student = await db.student.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
      });
      if (!student) {
        return { success: false, error: 'لم يتم العثور على بيانات الطالبة' };
      }
      targetStudentId = student.id;
    }

    if (!targetStudentId) {
      return { success: false, error: 'يجب تحديد الطالبة' };
    }

    // التحقق من الصلاحية إذا كان المستخدم معلمة
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      const studentEnrollment = await db.enrollment.findFirst({
        where: {
          studentId: targetStudentId,
          courseId: { in: teacherCourses.map(c => c.id) }
        }
      });
      if (!studentEnrollment) {
        return { success: false, error: 'غير مصرح بالوصول لبيانات هذه الطالبة' };
      }
    }

    // جلب درجات الطالبة الأسبوعية
    const studentGrades = await db.weeklyGrade.findMany({
      where: { studentId: targetStudentId },
      select: {
        week: true,
        grade: true,
        courseId: true
      },
      orderBy: { week: 'asc' }
    });

    if (studentGrades.length === 0) {
      return { success: true, data: [] };
    }

    // جلب متوسط الحلقة لكل أسبوع
    const courseId = studentGrades[0].courseId;
    const courseAverages = await db.weeklyGrade.groupBy({
      by: ['week'],
      where: { courseId },
      _avg: { grade: true }
    });

    const avgMap = new Map(courseAverages.map(a => [a.week, Number(a._avg.grade || 0)]));

    const result: StudentProgressItem[] = studentGrades.map(g => ({
      date: `w${g.week}`,
      dateLabel: `الأسبوع ${g.week}`,
      score: Number(g.grade),
      courseAverage: avgMap.get(g.week) || 0
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
}

// ==================== GRADES DISTRIBUTION ====================

/**
 * توزيع الدرجات في آخر تقييم (للمعلمة)
 */
export async function getGradesDistribution(filters?: {
  courseId?: string;
  type?: 'daily' | 'weekly' | 'monthly';
}): Promise<{ success: boolean; data?: GradesDistributionItem[]; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    let courseIds: string[] = [];
    
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      courseIds = teacherCourses.map(c => c.id);
    }

    if (filters?.courseId) {
      if (session.user.role === 'TEACHER' && !courseIds.includes(filters.courseId)) {
        return { success: false, error: 'غير مصرح بالوصول لهذه الحلقة' };
      }
      courseIds = [filters.courseId];
    }

    const gradeType = filters?.type || 'weekly';
    let grades: number[] = [];

    if (gradeType === 'daily') {
      const dailyGrades = await db.dailyGrade.findMany({
        where: {
          ...(courseIds.length > 0 && { courseId: { in: courseIds } })
        },
        select: { memorization: true, review: true },
        take: 500,
        orderBy: { date: 'desc' }
      });
      grades = dailyGrades.map(g => Number(g.memorization) + Number(g.review));
    } else if (gradeType === 'weekly') {
      const weeklyGrades = await db.weeklyGrade.findMany({
        where: {
          ...(courseIds.length > 0 && { courseId: { in: courseIds } })
        },
        select: { grade: true },
        take: 500,
        orderBy: { week: 'desc' }
      });
      grades = weeklyGrades.map(g => Number(g.grade));
    } else {
      const monthlyGrades = await db.monthlyGrade.findMany({
        where: {
          ...(courseIds.length > 0 && { courseId: { in: courseIds } })
        },
        select: { 
          quranForgetfulness: true,
          quranMajorMistakes: true,
          quranMinorMistakes: true,
          tajweedTheory: true
        },
        take: 500,
        orderBy: { month: 'desc' }
      });
      grades = monthlyGrades.map(g => 
        Number(g.quranForgetfulness) + 
        Number(g.quranMajorMistakes) + 
        Number(g.quranMinorMistakes) + 
        Number(g.tajweedTheory)
      );
    }

    // تحديد النطاقات حسب نوع الدرجة
    const maxGrade = gradeType === 'daily' ? 10 : gradeType === 'weekly' ? 5 : 30;
    const distribution = {
      excellent: 0,  // 90%+
      veryGood: 0,   // 75-89%
      good: 0,       // 60-74%
      needsImprovement: 0  // <60%
    };

    grades.forEach(grade => {
      const percentage = (grade / maxGrade) * 100;
      if (percentage >= 90) distribution.excellent++;
      else if (percentage >= 75) distribution.veryGood++;
      else if (percentage >= 60) distribution.good++;
      else distribution.needsImprovement++;
    });

    const total = grades.length || 1;

    const result: GradesDistributionItem[] = [
      {
        range: 'excellent',
        rangeLabel: 'ممتاز (90%+)',
        count: distribution.excellent,
        percentage: Number(((distribution.excellent / total) * 100).toFixed(1))
      },
      {
        range: 'veryGood',
        rangeLabel: 'جيد جداً (75-89%)',
        count: distribution.veryGood,
        percentage: Number(((distribution.veryGood / total) * 100).toFixed(1))
      },
      {
        range: 'good',
        rangeLabel: 'جيد (60-74%)',
        count: distribution.good,
        percentage: Number(((distribution.good / total) * 100).toFixed(1))
      },
      {
        range: 'needsImprovement',
        rangeLabel: 'يحتاج تحسين (<60%)',
        count: distribution.needsImprovement,
        percentage: Number(((distribution.needsImprovement / total) * 100).toFixed(1))
      }
    ];

    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching grades distribution:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
}

// ==================== DASHBOARD CHARTS DATA ====================

/**
 * جلب جميع بيانات الرسوم البيانية للـ Dashboard دفعة واحدة
 * استعلامات متسلسلة لتجنب استنفاد Connection Pool
 */
export async function getDashboardChartsData(): Promise<{
  success: boolean;
  data?: {
    performanceTrend: PerformanceTrendItem[];
    performanceDistribution: PerformanceDistributionItem[];
    courseComparison?: CourseComparisonItem[];
    studentProgress?: StudentProgressItem[];
  };
  error?: string;
}> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    // استعلامات متسلسلة لتجنب استنفاد Connection Pool
    const trendResult = await getPerformanceTrend();
    const distributionResult = await getPerformanceDistribution();

    const data: {
      performanceTrend: PerformanceTrendItem[];
      performanceDistribution: PerformanceDistributionItem[];
      courseComparison?: CourseComparisonItem[];
      studentProgress?: StudentProgressItem[];
    } = {
      performanceTrend: trendResult.data || [],
      performanceDistribution: distributionResult.data || []
    };

    // إضافة مقارنة الحلقات للمديرة فقط
    if (session.user.role === 'ADMIN') {
      const comparisonResult = await getCourseComparison();
      data.courseComparison = comparisonResult.data;
    }

    // إضافة تقدم الطالبة إذا كان المستخدم طالبة
    if (session.user.role === 'STUDENT') {
      const progressResult = await getStudentProgress();
      data.studentProgress = progressResult.data;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching dashboard charts data:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب البيانات' };
  }
}
