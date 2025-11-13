const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDailyGrades() {
  try {
    console.log('🔄 إنشاء جدول daily_grades في Supabase...');

    // إنشاء الجدول باستخدام $executeRawUnsafe (بروتوكول Supabase)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS daily_grades (
        id TEXT PRIMARY KEY,
        date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        memorization DECIMAL(4, 2) NOT NULL DEFAULT 0,
        review DECIMAL(4, 2) NOT NULL DEFAULT 0,
        notes TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        
        CONSTRAINT fk_daily_grades_student FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE,
        CONSTRAINT fk_daily_grades_course FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT unique_daily_grade_per_student_course_date UNIQUE ("studentId", "courseId", date)
      );
    `);

    console.log('✅ جدول daily_grades تم إنشاؤه بنجاح');

    // توليد Prisma Client الجديد
    console.log('🔄 توليد Prisma Client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('✅ Prisma Client تم توليده بنجاح');
    console.log('');
    console.log('📊 نظام الدرجات اليومية جاهز للاستخدام!');
  } catch (error) {
    console.error('❌ خطأ في إنشاء جدول daily_grades:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDailyGrades();
