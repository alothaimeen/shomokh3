const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 بدء إعداد جداول الدرجات الأسبوعية والشهرية...');

  try {
    // إنشاء جدول WeeklyGrade
    console.log('📝 إنشاء جدول weekly_grades...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS weekly_grades (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        week INTEGER NOT NULL CHECK (week >= 1 AND week <= 10),
        grade DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK (grade >= 0 AND grade <= 5),
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "weekly_grades_student_fkey" FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT "weekly_grades_course_fkey" FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT "weekly_grades_unique" UNIQUE ("studentId", "courseId", week)
      );
    `);
    console.log('✅ تم إنشاء جدول weekly_grades');

    // إنشاء جدول MonthlyGrade
    console.log('📝 إنشاء جدول monthly_grades...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS monthly_grades (
        id TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 3),
        "quranForgetfulness" DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK ("quranForgetfulness" >= 0 AND "quranForgetfulness" <= 5),
        "quranMajorMistakes" DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK ("quranMajorMistakes" >= 0 AND "quranMajorMistakes" <= 5),
        "quranMinorMistakes" DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK ("quranMinorMistakes" >= 0 AND "quranMinorMistakes" <= 5),
        "tajweedTheory" DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK ("tajweedTheory" >= 0 AND "tajweedTheory" <= 15),
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "monthly_grades_student_fkey" FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT "monthly_grades_course_fkey" FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT "monthly_grades_unique" UNIQUE ("studentId", "courseId", month)
      );
    `);
    console.log('✅ تم إنشاء جدول monthly_grades');

    // إنشاء Indexes لتحسين الأداء
    console.log('📝 إنشاء Indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "weekly_grades_course_idx" ON weekly_grades("courseId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "monthly_grades_course_idx" ON monthly_grades("courseId");
    `);
    console.log('✅ تم إنشاء Indexes');

    console.log('🎉 اكتمل إعداد جداول الدرجات الأسبوعية والشهرية بنجاح!');
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
