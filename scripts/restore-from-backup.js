/**
 * سكربت استعادة البيانات المُحسّن (High Performance)
 * ================================================
 * يستعيد البيانات من ملف backup-*.json إلى قاعدة البيانات
 * 
 * التحسينات:
 * - استخدام createMany مع skipDuplicates بدلاً من create المفرد
 * - تقسيم البيانات إلى دفعات (1000 سجل)
 * - معالجة متسلسلة لتجنب استنفاد Connection Pool
 * - إعادة المحاولة عند الخطأ (Retry with backoff)
 * - إحصائيات أداء مفصلة
 * 
 * Usage: node scripts/restore-from-backup.js [backup-file.json]
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ==================== UTILITIES ====================

// تقسيم المصفوفة إلى دفعات
function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

// إعادة المحاولة عند الفشل
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * attempt;
      console.log(`  ⚠️ خطأ، إعادة المحاولة ${attempt}/${maxRetries} بعد ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// تحويل التاريخ بأمان
function safeDate(dateStr) {
  if (!dateStr) return new Date();
  return new Date(dateStr);
}

// تحويل Decimal بأمان
function safeDecimal(value) {
  if (value === null || value === undefined) return 0;
  return parseFloat(value);
}

// ==================== BATCH INSERT ====================

async function batchInsert(modelName, records, transform, batchSize = 1000) {
  if (!records || records.length === 0) {
    console.log(`   ⏭️ لا توجد سجلات`);
    return { inserted: 0, total: 0, time: 0 };
  }

  const startTime = Date.now();
  const chunks = chunk(records, batchSize);
  let totalInserted = 0;

  for (const [i, batch] of chunks.entries()) {
    await withRetry(async () => {
      const data = batch.map(transform);
      const result = await prisma[modelName].createMany({
        data,
        skipDuplicates: true
      });
      totalInserted += result.count;
    });

    // طباعة التقدم كل 5 دفعات
    if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
      const progress = Math.round(((i + 1) / chunks.length) * 100);
      process.stdout.write(`\r   ⏳ ${progress}% (${Math.min((i + 1) * batchSize, records.length)}/${records.length})`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\r   ✅ ${totalInserted}/${records.length} سجل (${elapsed}s)                    `);

  return { inserted: totalInserted, total: records.length, time: elapsed };
}

// ==================== MAIN RESTORE FUNCTION ====================

async function restore() {
  console.log('\n🚀 بدء استعادة البيانات (النسخة المُحسّنة)...\n');
  const globalStart = Date.now();

  // البحث عن ملف النسخة الاحتياطية
  let backupFile = process.argv[2];
  if (!backupFile) {
    // البحث عن أحدث ملف backup
    const files = fs.readdirSync(process.cwd())
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();
    backupFile = files[0];
  }

  if (!backupFile || !fs.existsSync(backupFile)) {
    console.error('❌ لم يتم العثور على ملف النسخة الاحتياطية');
    console.error('   Usage: node scripts/restore-from-backup.js backup-file.json');
    process.exit(1);
  }

  console.log('📂 ملف النسخة الاحتياطية:', backupFile);
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  console.log('📊 إجمالي السجلات:', backup.stats?.totalRecords || 'غير محدد');
  console.log('📅 تاريخ النسخة:', backup.metadata?.createdAt || 'غير محدد');
  console.log('\n' + '='.repeat(50) + '\n');

  const stats = {};

  try {
    // 1. المستخدمين (Users)
    console.log('👥 استعادة المستخدمين...');
    stats.users = await batchInsert('user', backup.data.users, (u) => ({
      id: u.id,
      userName: u.userName,
      userEmail: u.userEmail,
      passwordHash: u.passwordHash,
      userRole: u.userRole,
      isActive: u.isActive ?? true,
      createdAt: safeDate(u.createdAt),
      updatedAt: safeDate(u.updatedAt)
    }));

    // 2. البرامج (Programs)
    console.log('📚 استعادة البرامج...');
    stats.programs = await batchInsert('program', backup.data.programs, (p) => ({
      id: p.id,
      programName: p.programName,
      programDescription: p.programDescription,
      isActive: p.isActive ?? true,
      createdAt: safeDate(p.createdAt),
      updatedAt: safeDate(p.updatedAt)
    }));

    // 3. الحلقات (Courses)
    console.log('🎓 استعادة الحلقات...');
    stats.courses = await batchInsert('course', backup.data.courses, (c) => ({
      id: c.id,
      courseName: c.courseName,
      courseDescription: c.courseDescription,
      syllabus: c.syllabus,
      level: c.level ?? 1,
      programId: c.programId,
      teacherId: c.teacherId,
      maxStudents: c.maxStudents ?? 20,
      isActive: c.isActive ?? true,
      createdAt: safeDate(c.createdAt),
      updatedAt: safeDate(c.updatedAt)
    }));

    // 4. الطالبات (Students)
    console.log('👧 استعادة الطالبات...');
    stats.students = await batchInsert('student', backup.data.students, (s) => ({
      id: s.id,
      studentNumber: s.studentNumber,
      studentName: s.studentName,
      qualification: s.qualification || 'غير محدد',
      nationality: s.nationality || 'سعودية',
      studentPhone: s.studentPhone || '',
      memorizedAmount: s.memorizedAmount || 'غير محدد',
      paymentStatus: s.paymentStatus || 'UNPAID',
      memorizationPlan: s.memorizationPlan,
      notes: s.notes,
      userId: s.userId,
      isActive: s.isActive ?? true,
      createdAt: safeDate(s.createdAt),
      updatedAt: safeDate(s.updatedAt)
    }));

    // 5. طلبات التسجيل (EnrollmentRequests)
    console.log('📋 استعادة طلبات التسجيل...');
    stats.enrollmentRequests = await batchInsert('enrollmentRequest', backup.data.enrollmentRequests, (e) => ({
      id: e.id,
      studentId: e.studentId,
      courseId: e.courseId,
      status: e.status || 'PENDING',
      message: e.message,
      createdAt: safeDate(e.createdAt),
      updatedAt: safeDate(e.updatedAt)
    }));

    // 6. التسجيلات (Enrollments)
    console.log('📝 استعادة التسجيلات...');
    stats.enrollments = await batchInsert('enrollment', backup.data.enrollments, (e) => ({
      id: e.id,
      studentId: e.studentId,
      courseId: e.courseId,
      enrolledAt: safeDate(e.enrolledAt),
      isActive: e.isActive ?? true,
      createdAt: safeDate(e.createdAt),
      updatedAt: safeDate(e.updatedAt)
    }));

    // 7. الحضور (Attendance)
    console.log('📅 استعادة الحضور...');
    stats.attendance = await batchInsert('attendance', backup.data.attendance, (a) => ({
      id: a.id,
      studentId: a.studentId,
      courseId: a.courseId,
      date: safeDate(a.date),
      status: a.status || 'PRESENT',
      notes: a.notes,
      createdAt: safeDate(a.createdAt),
      updatedAt: safeDate(a.updatedAt)
    }));

    // 8. الدرجات اليومية (DailyGrades)
    console.log('📊 استعادة الدرجات اليومية...');
    stats.dailyGrades = await batchInsert('dailyGrade', backup.data.dailyGrades, (g) => ({
      id: g.id,
      studentId: g.studentId,
      courseId: g.courseId,
      date: safeDate(g.date),
      memorization: safeDecimal(g.memorization),
      review: safeDecimal(g.review),
      notes: g.notes,
      createdAt: safeDate(g.createdAt),
      updatedAt: safeDate(g.updatedAt)
    }));

    // 9. الدرجات الأسبوعية (WeeklyGrades)
    console.log('📊 استعادة الدرجات الأسبوعية...');
    stats.weeklyGrades = await batchInsert('weeklyGrade', backup.data.weeklyGrades, (g) => ({
      id: g.id,
      studentId: g.studentId,
      courseId: g.courseId,
      week: g.week || g.weekNumber,
      grade: safeDecimal(g.grade),
      notes: g.notes,
      createdAt: safeDate(g.createdAt),
      updatedAt: safeDate(g.updatedAt)
    }));

    // 10. الدرجات الشهرية (MonthlyGrades)
    console.log('📊 استعادة الدرجات الشهرية...');
    stats.monthlyGrades = await batchInsert('monthlyGrade', backup.data.monthlyGrades, (g) => ({
      id: g.id,
      studentId: g.studentId,
      courseId: g.courseId,
      month: g.month || g.monthNumber,
      quranForgetfulness: safeDecimal(g.quranForgetfulness),
      quranMajorMistakes: safeDecimal(g.quranMajorMistakes || g.quranMajor),
      quranMinorMistakes: safeDecimal(g.quranMinorMistakes || g.quranMinor),
      tajweedTheory: safeDecimal(g.tajweedTheory || g.tajweed),
      notes: g.notes,
      createdAt: safeDate(g.createdAt),
      updatedAt: safeDate(g.updatedAt)
    }));

    // 11. الاختبارات النهائية (FinalExams)
    console.log('📝 استعادة الاختبارات النهائية...');
    stats.finalExams = await batchInsert('finalExam', backup.data.finalExams, (e) => ({
      id: e.id,
      studentId: e.studentId,
      courseId: e.courseId,
      quranTest: safeDecimal(e.quranTest || e.grade),
      tajweedTest: safeDecimal(e.tajweedTest || 0),
      notes: e.notes,
      createdAt: safeDate(e.createdAt),
      updatedAt: safeDate(e.updatedAt)
    }));

    // 12. درجات السلوك (BehaviorGrades)
    console.log('⭐ استعادة درجات السلوك...');
    stats.behaviorGrades = await batchInsert('behaviorGrade', backup.data.behaviorGrades, (g) => ({
      id: g.id,
      studentId: g.studentId,
      courseId: g.courseId,
      date: safeDate(g.date),
      dailyScore: safeDecimal(g.dailyScore || g.grade),
      notes: g.notes,
      createdAt: safeDate(g.createdAt),
      updatedAt: safeDate(g.updatedAt)
    }));

    // 13. المهام اليومية (DailyTasks)
    console.log('✅ استعادة المهام اليومية...');
    stats.dailyTasks = await batchInsert('dailyTask', backup.data.dailyTasks, (t) => ({
      id: t.id,
      studentId: t.studentId,
      courseId: t.courseId,
      date: safeDate(t.date),
      listening5Times: t.listening5Times ?? false,
      repetition10Times: t.repetition10Times ?? false,
      recitedToPeer: t.recitedToPeer ?? false,
      notes: t.notes,
      createdAt: safeDate(t.createdAt),
      updatedAt: safeDate(t.updatedAt)
    }));

    // 14. نقاط السلوك (BehaviorPoints)
    console.log('🏆 استعادة نقاط السلوك...');
    stats.behaviorPoints = await batchInsert('behaviorPoint', backup.data.behaviorPoints, (p) => ({
      id: p.id,
      studentId: p.studentId,
      courseId: p.courseId,
      date: safeDate(p.date),
      earlyAttendance: p.earlyAttendance ?? p.attendance ?? false,
      perfectMemorization: p.perfectMemorization ?? false,
      activeParticipation: p.activeParticipation ?? p.interaction ?? false,
      timeCommitment: p.timeCommitment ?? p.focus ?? false,
      notes: p.notes,
      createdAt: safeDate(p.createdAt),
      updatedAt: safeDate(p.updatedAt)
    }));

    // 15. إعدادات الموقع (PublicSiteSettings)
    console.log('⚙️ استعادة إعدادات الموقع...');
    stats.publicSiteSettings = await batchInsert('publicSiteSettings', backup.data.publicSiteSettings, (s) => ({
      id: s.id,
      studentsCount: s.studentsCount ?? 0,
      teachersCount: s.teachersCount ?? 0,
      coursesCount: s.coursesCount ?? 0,
      facesCompleted: s.facesCompleted ?? 0,
      aboutTitle: s.aboutTitle,
      aboutVision: s.aboutVision,
      aboutMission: s.aboutMission,
      aboutGoals: s.aboutGoals,
      achievementsTitle: s.achievementsTitle,
      achievementsText: s.achievementsText,
      contactTitle: s.contactTitle,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      contactAddress: s.contactAddress,
      contactWhatsapp: s.contactWhatsapp,
      contactIban: s.contactIban,
      isActive: s.isActive ?? true,
      lastEditedById: s.lastEditedById,
      createdAt: safeDate(s.createdAt),
      updatedAt: safeDate(s.updatedAt)
    }));

    // ==================== SUMMARY ====================
    const totalTime = ((Date.now() - globalStart) / 1000).toFixed(2);
    const totalInserted = Object.values(stats).reduce((sum, s) => sum + (s?.inserted || 0), 0);
    const totalRecords = Object.values(stats).reduce((sum, s) => sum + (s?.total || 0), 0);

    console.log('\n' + '='.repeat(50));
    console.log('✅ تمت الاستعادة بنجاح!');
    console.log('='.repeat(50));
    console.log(`\n📊 ملخص الاستعادة:`);
    console.log('-'.repeat(40));

    for (const [name, stat] of Object.entries(stats)) {
      if (stat && stat.total > 0) {
        const status = stat.inserted === stat.total ? '✅' : '⚠️';
        console.log(`   ${status} ${name.padEnd(20)} ${stat.inserted}/${stat.total} (${stat.time}s)`);
      }
    }

    console.log('-'.repeat(40));
    console.log(`   📦 الإجمالي: ${totalInserted.toLocaleString()}/${totalRecords.toLocaleString()} سجل`);
    console.log(`   ⏱️ الوقت الكلي: ${totalTime}s`);
    console.log(`   🚀 السرعة: ${Math.round(totalRecords / totalTime)} سجل/ثانية`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ خطأ في الاستعادة:', error.message);
    if (error.code === 'P1001') {
      console.error('   ⚠️ فشل الاتصال بقاعدة البيانات');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاستعادة
restore();
