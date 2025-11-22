const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 بدء الفحص الشامل لنظام شموخ v3...\n');
  const report = {
    timestamp: new Date().toISOString(),
    integrityIssues: [],
    dataLogicIssues: [],
    calculationTests: [],
    securityFlags: []
  };

  // ==========================================
  // 1. فحص تكامل العلاقات (Referential Integrity)
  // ==========================================
  console.log('1️⃣  فحص تكامل العلاقات...');

  // أ. المستخدمون والطالبات
  const studentsWithoutUser = await prisma.student.findMany({
    where: { userId: null }
  });
  if (studentsWithoutUser.length > 0) {
    report.integrityIssues.push('❌ وجد ' + studentsWithoutUser.length + ' طالبات بدون حساب مستخدم (userId is null).');
  }

  const studentUsers = await prisma.user.findMany({
    where: { userRole: 'STUDENT' },
    include: { student: true }
  });
  const usersWithoutStudentProfile = studentUsers.filter(u => !u.student);
  if (usersWithoutStudentProfile.length > 0) {
    report.integrityIssues.push('❌ وجد ' + usersWithoutStudentProfile.length + ' مستخدمين (دور طالبة) بدون ملف طالب (Student profile).');
  }

  // ب. المعلمات والحلقات
  const coursesWithoutTeacher = await prisma.course.findMany({
    where: { teacherId: null }
  });
  if (coursesWithoutTeacher.length > 0) {
    report.integrityIssues.push('❌ وجد ' + coursesWithoutTeacher.length + ' حلقات بدون معلمة (teacherId is null).');
  }

  // ج. التسجيلات (Enrollments)
  const orphanEnrollments = await prisma.enrollment.findMany({
    where: {
      OR: [
        { studentId: { equals: 'non-existent' } }, // Prisma checks FKs usually, but checking logical orphans
        { courseId: { equals: 'non-existent' } }
      ]
    }
  });
  // Note: Prisma ensures FK constraints usually, but we check for logical issues or if raw SQL was used badly.
  // Better check: Check for duplicates
  const allEnrollments = await prisma.enrollment.findMany();
  const enrollmentMap = new Map();
  let duplicateEnrollmentsCount = 0;
  for (const e of allEnrollments) {
    const key = `${e.studentId}-${e.courseId}`;
    if (enrollmentMap.has(key)) {
      duplicateEnrollmentsCount++;
    } else {
      enrollmentMap.set(key, true);
    }
  }
  if (duplicateEnrollmentsCount > 0) {
    report.integrityIssues.push('❌ وجد ' + duplicateEnrollmentsCount + ' تسجيلات مكررة (نفس الطالبة في نفس الحلقة).');
  }

  // د. الدرجات يتيمة (Orphan Grades) - التحقق من أن الطالب مسجل في الحلقة التي له درجة فيها
  console.log('   - فحص الدرجات اليتيمة (طالبة لها درجة في حلقة غير مسجلة فيها)...');
  
  async function checkGradesEnrollment(modelName, tableName) {
    // Get all grades
    // We need to join with Enrollment to check if an active enrollment exists
    // Prisma doesn't support cross-relation filtering easily on non-related fields efficiently in one go without raw query
    // or iterating. Let's iterate for diagnosis (dataset is likely small enough for dev).
    
    // Actually, simpler: Find grades where NOT EXISTS (Enrollment matches studentId + courseId)
    // Using raw query for efficiency
    const orphans = await prisma.$queryRawUnsafe(`
      SELECT g.id, g."studentId", g."courseId" 
      FROM "${tableName}" g
      LEFT JOIN "enrollments" e ON g."studentId" = e."studentId" AND g."courseId" = e."courseId" AND e."isActive" = true
      WHERE e.id IS NULL
    `);
    
    if (orphans.length > 0) {
      report.securityFlags.push('⚠️ ' + modelName + ': وجد ' + orphans.length + ' درجات لطالبات غير مسجلات حالياً في الحلقة (قد يكون تسجيل ملغي أو خطأ في البيانات).');
    }
  }

  await checkGradesEnrollment('DailyGrade', 'daily_grades');
  await checkGradesEnrollment('WeeklyGrade', 'weekly_grades');
  await checkGradesEnrollment('MonthlyGrade', 'monthly_grades');
  await checkGradesEnrollment('FinalExam', 'final_exams');
  await checkGradesEnrollment('BehaviorGrade', 'behavior_grades');


  // ==========================================
  // 2. فحص منطق البيانات (Data Logic)
  // ==========================================
  console.log('2️⃣  فحص منطق البيانات...');

  // أ. تواريخ مستقبلية
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const futureDailyGrades = await prisma.dailyGrade.count({
    where: { date: { gt: tomorrow } }
  });
  if (futureDailyGrades > 0) {
    report.dataLogicIssues.push('❌ وجد ' + futureDailyGrades + ' درجات يومية مسجلة بتواريخ مستقبلية.');
  }

  // ب. القيم الشاذة (Out of Range)
  const invalidDaily = await prisma.dailyGrade.count({
    where: { OR: [{ memorization: { gt: 5 } }, { review: { gt: 5 } }, { memorization: { lt: 0 } }, { review: { lt: 0 } }] }
  });
  if (invalidDaily > 0) report.dataLogicIssues.push('❌ وجد ' + invalidDaily + ' درجات يومية خارج النطاق (0-5).');

  const invalidWeekly = await prisma.weeklyGrade.count({
    where: { OR: [{ grade: { gt: 5 } }, { grade: { lt: 0 } }] }
  });
  if (invalidWeekly > 0) report.dataLogicIssues.push('❌ وجد ' + invalidWeekly + ' درجات أسبوعية خارج النطاق (0-5).');

  const invalidBehavior = await prisma.behaviorGrade.count({
    where: { OR: [{ dailyScore: { gt: 1 } }, { dailyScore: { lt: 0 } }] }
  });
  if (invalidBehavior > 0) report.dataLogicIssues.push('❌ وجد ' + invalidBehavior + ' درجات سلوك خارج النطاق (0-1).');

  const invalidMonthly = await prisma.monthlyGrade.count({
    where: { 
      OR: [
        { quranForgetfulness: { gt: 5 } }, 
        { quranMajorMistakes: { gt: 5 } },
        { quranMinorMistakes: { gt: 5 } },
        { tajweedTheory: { gt: 15 } }
      ] 
    }
  });
  if (invalidMonthly > 0) report.dataLogicIssues.push('❌ وجد ' + invalidMonthly + ' درجات شهرية خارج النطاق.');


  // ==========================================
  // 3. محاكاة الحسابات (Calculation Simulation)
  // ==========================================
  console.log('3️⃣  محاكاة الحسابات (Grading Formulas)...');

  // دوال المحاكاة (نسخة مبسطة من grading-formulas.ts)
  const SIM = {
    daily: (raw) => (raw / 700) * 50,
    weekly: (raw) => raw, // Raw 50 -> Final 50? No, sum of 10 weeks * 5 = 50. Yes.
    monthly: (raw) => (raw / 90) * 30,
    behavior: (raw) => (raw / 70) * 10,
    finalExam: (raw) => raw, // 60 -> 60
    total: (d, w, m, b, f) => d + w + m + b + f
  };

  // اختبار الدرجة الكاملة
  const perfect = {
    dailyRaw: 700, // 10 * 70 days
    weeklyRaw: 50, // 5 * 10 weeks
    monthlyRaw: 90, // 30 * 3 months
    behaviorRaw: 70, // 1 * 70 days
    finalExamRaw: 60 // 40 + 20
  };

  const perfectCalc = {
    daily: SIM.daily(perfect.dailyRaw),
    weekly: SIM.weekly(perfect.weeklyRaw),
    monthly: SIM.monthly(perfect.monthlyRaw),
    behavior: SIM.behavior(perfect.behaviorRaw),
    finalExam: SIM.finalExam(perfect.finalExamRaw),
  };
  perfectCalc.total = SIM.total(perfectCalc.daily, perfectCalc.weekly, perfectCalc.monthly, perfectCalc.behavior, perfectCalc.finalExam);

  if (Math.abs(perfectCalc.total - 200) < 0.01) {
    report.calculationTests.push('✅ اختبار الدرجة الكاملة: ناجح (المجموع 200).');
  } else {
    report.calculationTests.push('❌ اختبار الدرجة الكاملة: فشل (المجموع ' + perfectCalc.total + ' بدلاً من 200).');
  }

  // اختبار النصف
  const half = {
    dailyRaw: 350,
    weeklyRaw: 25,
    monthlyRaw: 45,
    behaviorRaw: 35,
    finalExamRaw: 30
  };
  
  const halfCalc = {
    daily: SIM.daily(half.dailyRaw),
    weekly: SIM.weekly(half.weeklyRaw),
    monthly: SIM.monthly(half.monthlyRaw),
    behavior: SIM.behavior(half.behaviorRaw),
    finalExam: SIM.finalExam(half.finalExamRaw),
  };
  halfCalc.total = SIM.total(halfCalc.daily, halfCalc.weekly, halfCalc.monthly, halfCalc.behavior, halfCalc.finalExam);
  
  if (Math.abs(halfCalc.total - 100) < 0.01) {
    report.calculationTests.push('✅ اختبار نصف الدرجة: ناجح (المجموع 100).');
  } else {
    report.calculationTests.push('❌ اختبار نصف الدرجة: فشل (المجموع ' + halfCalc.total + ' بدلاً من 100).');
  }


  // ==========================================
  // الطباعة والتقرير
  // ==========================================
  console.log('\n📊 --- ملخص التقرير ---');
  if (report.integrityIssues.length === 0) console.log('✅ تكامل العلاقات: سليم');
  else report.integrityIssues.forEach(msg => console.log(msg));

  if (report.dataLogicIssues.length === 0) console.log('✅ منطق البيانات: سليم');
  else report.dataLogicIssues.forEach(msg => console.log(msg));

  report.calculationTests.forEach(msg => console.log(msg));
  
  if (report.securityFlags.length === 0) console.log('✅ العزل (بيانات): لم يتم العثور على سجلات يتيمة واضحة');
  else report.securityFlags.forEach(msg => console.log(msg));

  console.log('\nتم الانتهاء.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
