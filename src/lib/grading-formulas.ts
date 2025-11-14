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

export function calculateFinalGrade(student: {
  dailyGrades: number; // 700 درجة خام
  weeklyGrades: number; // 50 درجة (10 × 5)
  monthlyGrades: number; // 90 درجة خام
  behaviorGrades: number; // 70 درجة خام
  finalExam: number; // 60 درجة
}) {
  const daily = student.dailyGrades / 14; // 700 ÷ 14 = 50
  const weekly = student.weeklyGrades; // 50 already (10 × 5)
  const monthly = student.monthlyGrades / 3; // 90 ÷ 3 = 30
  const behavior = student.behaviorGrades / 7; // 70 ÷ 7 = 10
  const finalScore = student.finalExam; // 60

  const total = daily + weekly + monthly + behavior + finalScore;
  const percentage = (total / 200) * 100;

  return {
    daily,
    weekly,
    monthly,
    behavior,
    final: finalScore,
    total,
    percentage,
  };
}
