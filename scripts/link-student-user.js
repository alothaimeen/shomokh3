const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkStudentToUser() {
  try {
    console.log('🔗 ربط جدول Student بـ User...');

    // التحقق من وجود العمود userId في جدول students
    await prisma.$executeRawUnsafe(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS "userId" TEXT UNIQUE;
    `);

    // إضافة القيد (foreign key)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'students_userId_fkey'
        ) THEN
          ALTER TABLE students 
          ADD CONSTRAINT students_userId_fkey 
          FOREIGN KEY ("userId") REFERENCES users(id) 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    console.log('✅ تم ربط Student بـ User بنجاح');
    console.log('⚠️  قم بإيقاف السيرفر وتشغيل: npx prisma generate');

  } catch (error) {
    console.error('❌ خطأ في الربط:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

linkStudentToUser();
