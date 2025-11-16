export type DailyGradeComponents = {
  quranMemorization: number;
  tajweedMemorization: number;
  quranReview: number;
  tajweedReview: number;
};

export const DAILY_GRADE_CONFIG = {
  totalDays: 70,
  dailyPoints: 10,
  components: {
    quranMemorization: 2.5,
    tajweedMemorization: 2.5,
    quranReview: 2.5,
    tajweedReview: 2.5,
  } as DailyGradeComponents,
};

/**
 * حساب الدرجة اليومية المبسطة كما في الخطة (700 ÷ 14 = 50)
 * @param days عدد الأيام المحسوبة (مثال: أيام الحضور)
 * @returns قيمة الدرجة بعد تطبيق الصيغة الثابتة
 */
export function calculateDailyGrade(days: number): number {
  if (!Number.isFinite(days) || days <= 0) return 0;
  return (days * DAILY_GRADE_CONFIG.dailyPoints) / 14;
}

/**
 * دالة مساعدة لتوليد قيم الربع درجة للقوائم المنسدلة (مثلاً: 10, 9.75, 9.5, ...)
 */
export function generateQuarterStepValues(max = 10, step = 0.25): number[] {
  const values: number[] = [];
  for (let v = max; v >= 0; v = Math.round((v - step) * 100) / 100) {
    values.push(Math.round(v * 100) / 100);
    if (v === 0) break;
  }
  return values;
}

/**
 * حساب الدرجة الأسبوعية (10 أسابيع × 5 درجات = 50 درجة)
 * @param weeklyGrades مصفوفة من 10 درجات أسبوعية
 * @returns المجموع (0 - 50)
 */
export function calculateWeeklyTotal(weeklyGrades: number[]): number {
  if (!Array.isArray(weeklyGrades) || weeklyGrades.length !== 10) {
    console.warn('يجب أن يكون هناك 10 درجات أسبوعية');
    return 0;
  }
  return weeklyGrades.reduce((sum, grade) => sum + grade, 0);
}

/**
 * حساب الدرجة الشهرية (3 أشهر × 30 درجة = 90 درجة خام ÷ 3 = 30 درجة نهائية)
 * كل شهر: القرآن (15) + التجويد النظري (15) = 30 درجة
 * @param monthlyGrades مصفوفة من 3 درجات شهرية
 * @returns المجموع النهائي (0 - 30)
 */
export function calculateMonthlyTotal(monthlyGrades: number[]): number {
  if (!Array.isArray(monthlyGrades) || monthlyGrades.length !== 3) {
    console.warn('يجب أن يكون هناك 3 درجات شهرية');
    return 0;
  }
  const rawTotal = monthlyGrades.reduce((sum, grade) => sum + grade, 0);
  return rawTotal / 3; // 90 ÷ 3 = 30
}

/**
 * حساب درجة الشهر الواحد من مكوناته
 * @param components مكونات الدرجة الشهرية
 * @returns المجموع (0 - 30)
 */
export function calculateSingleMonthGrade(components: {
  quranForgetfulness: number;
  quranMajorMistakes: number;
  quranMinorMistakes: number;
  tajweedTheory: number;
}): number {
  return (
    components.quranForgetfulness +
    components.quranMajorMistakes +
    components.quranMinorMistakes +
    components.tajweedTheory
  );
}

/**
 * حساب إجمالي درجة الاختبار النهائي (القرآن + التجويد)
 * @param quranTest درجة اختبار القرآن (0-40)
 * @param tajweedTest درجة اختبار التجويد (0-20)
 * @returns المجموع (0-60)
 */
export function calculateFinalExamTotal(quranTest: number, tajweedTest: number): number {
  return quranTest + tajweedTest;
}

/**
 * حساب إجمالي السلوك الخام (مجموع 70 يوم × درجة 0-1)
 * @param behaviorGrades مصفوفة الدرجات اليومية
 * @returns المجموع الخام (0-70)
 */
export function calculateBehaviorRaw(behaviorGrades: number[]): number {
  if (!Array.isArray(behaviorGrades)) return 0;
  return behaviorGrades.reduce((sum, grade) => sum + grade, 0);
}

/**
 * حساب السلوك النهائي (70 درجة خام ÷ 7 = 10 درجات نهائية)
 * @param rawBehaviorTotal المجموع الخام للسلوك
 * @returns الدرجة النهائية (0-10)
 */
export function calculateBehaviorTotal(rawBehaviorTotal: number): number {
  return rawBehaviorTotal / 7;
}

/**
 * حساب الدرجة اليومية النهائية (700 ÷ 14 = 50)
 * @param rawDailyTotal المجموع الخام (0-700)
 * @returns الدرجة النهائية (0-50)
 */
export function calculateDailyFinalGrade(rawDailyTotal: number): number {
  return rawDailyTotal / 14;
}

/**
 * حساب الدرجة الأسبوعية النهائية (10 أسابيع × 5 = 50)
 * @param rawWeeklyTotal المجموع (0-50)
 * @returns الدرجة النهائية (0-50)
 */
export function calculateWeeklyFinalGrade(rawWeeklyTotal: number): number {
  return rawWeeklyTotal; // Already 50
}

/**
 * حساب الدرجة الشهرية النهائية (90 ÷ 3 = 30)
 * @param rawMonthlyTotal المجموع الخام (0-90)
 * @returns الدرجة النهائية (0-30)
 */
export function calculateMonthlyFinalGrade(rawMonthlyTotal: number): number {
  return rawMonthlyTotal / 3;
}

/**
 * حساب الدرجة السلوكية النهائية (70 ÷ 7 = 10)
 * @param rawBehaviorTotal المجموع الخام (0-70)
 * @returns الدرجة النهائية (0-10)
 */
export function calculateBehaviorFinalGrade(rawBehaviorTotal: number): number {
  return rawBehaviorTotal / 7;
}

/**
 * حساب الدرجة النهائية للاختبار (القرآن + التجويد = 60)
 * @param finalExamTotal المجموع (0-60)
 * @returns الدرجة النهائية (0-60)
 */
export function calculateFinalExamFinalGrade(finalExamTotal: number): number {
  return finalExamTotal; // Already 60
}

/**
 * حساب المجموع النهائي والنسبة المئوية
 * @param grades كائن يحتوي على جميع الدرجات الخام
 * @returns كائن يحتوي على الدرجات النهائية والمجموع والنسبة المئوية
 */
export function calculateFinalGrade(grades: {
  dailyRaw: number; // 0-700
  weeklyRaw: number; // 0-50
  monthlyRaw: number; // 0-90
  behaviorRaw: number; // 0-70
  finalExamRaw: number; // 0-60
}) {
  const daily = calculateDailyFinalGrade(grades.dailyRaw); // 50
  const weekly = calculateWeeklyFinalGrade(grades.weeklyRaw); // 50
  const monthly = calculateMonthlyFinalGrade(grades.monthlyRaw); // 30
  const behavior = calculateBehaviorFinalGrade(grades.behaviorRaw); // 10
  const finalExam = calculateFinalExamFinalGrade(grades.finalExamRaw); // 60

  const total = daily + weekly + monthly + behavior + finalExam; // 200
  const percentage = (total / 200) * 100;

  return {
    daily: Math.round(daily * 100) / 100,
    weekly: Math.round(weekly * 100) / 100,
    monthly: Math.round(monthly * 100) / 100,
    behavior: Math.round(behavior * 100) / 100,
    finalExam: Math.round(finalExam * 100) / 100,
    total: Math.round(total * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
  };
}
