const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDailyTasksStructure() {
  try {
    console.log('🔄 تحديث بنية جدول daily_tasks...');

    // حذف الجدول القديم
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "daily_tasks" CASCADE;`);
    console.log('✅ تم حذف الجدول القديم');

    // إنشاء الجدول الجديد بالبنية الصحيحة
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "daily_tasks" (
        "id" TEXT PRIMARY KEY,
        "date" TIMESTAMP(3) NOT NULL,
        "listening5Times" BOOLEAN NOT NULL DEFAULT false,
        "repetition10Times" BOOLEAN NOT NULL DEFAULT false,
        "recitedToPeer" BOOLEAN NOT NULL DEFAULT false,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "studentId" TEXT NOT NULL,
        "courseId" TEXT NOT NULL,
        CONSTRAINT "daily_tasks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "daily_tasks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
        UNIQUE ("studentId", "courseId", "date")
      );
    `);
    console.log('✅ تم إنشاء الجدول الجديد بنجاح');

    console.log('✅ اكتمل تحديث جدول المهام اليومية');
  } catch (error) {
    console.error('❌ خطأ في تحديث الجدول:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDailyTasksStructure();
