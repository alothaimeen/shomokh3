const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 بدء إعداد جداول الاختبار النهائي والسلوك...');

  try {
    // إنشاء جدول FinalExam
    console.log('📝 إنشاء جدول final_exams...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS final_exams (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        "quranTest" DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK ("quranTest" >= 0 AND "quranTest" <= 40),
        "tajweedTest" DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK ("tajweedTest" >= 0 AND "tajweedTest" <= 20),
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "final_exams_student_fkey" FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT "final_exams_course_fkey" FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT "final_exams_unique" UNIQUE ("studentId", "courseId")
      );
    `);
    console.log('✅ تم إنشاء جدول final_exams');

    // إنشاء جدول BehaviorGrade
    console.log('📝 إنشاء جدول behavior_grades...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS behavior_grades (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        "dailyScore" DECIMAL(3, 2) NOT NULL DEFAULT 0 CHECK ("dailyScore" >= 0 AND "dailyScore" <= 1),
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "behavior_grades_student_fkey" FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT "behavior_grades_course_fkey" FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT "behavior_grades_unique" UNIQUE ("studentId", "courseId", date)
      );
    `);
    console.log('✅ تم إنشاء جدول behavior_grades');

    // إنشاء Indexes لتحسين الأداء
    console.log('📝 إنشاء Indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "final_exams_course_idx" ON final_exams("courseId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "behavior_grades_course_idx" ON behavior_grades("courseId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "behavior_grades_date_idx" ON behavior_grades(date);
    `);
    console.log('✅ تم إنشاء Indexes');

    // إعادة توليد Prisma Client
    console.log('📝 إعادة توليد Prisma Client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ تم إعادة توليد Prisma Client');

    console.log('🎉 اكتمل إعداد جداول الاختبار النهائي والسلوك بنجاح!');
  } catch (error) {
    console.error('❌ خطأ أثناء إعداد الجداول:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
