// 🔧 سكريبت تحديث رموز الحضور والغياب - منصة شموخ v3
// يستخدم $executeRawUnsafe حسب بروتوكول Supabase

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAttendanceStatus() {
  try {
    console.log('🔄 بدء تحديث رموز الحضور والغياب...');

    // الخطوة 1: التحقق من وجود الجدول وحفظ البيانات
    console.log('📝 الخطوة 1: التحقق من البيانات الموجودة...');
    const existingData = await prisma.$queryRaw`SELECT * FROM attendance LIMIT 5`;
    console.log(`  وجد ${existingData.length} سجلات موجودة`);

    // الخطوة 2: حذف الـ enum القديم (سيحذف العمود تلقائياً)
    console.log('📝 الخطوة 2: حذف enum القديم...');
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "AttendanceStatus" CASCADE`);

    // الخطوة 3: إنشاء enum جديد بالرموز المحدثة
    console.log('📝 الخطوة 3: إنشاء enum جديد...');
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "AttendanceStatus" AS ENUM (
        'PRESENT',
        'EXCUSED',
        'ABSENT',
        'REVIEWED',
        'LEFT_EARLY'
      )
    `);

    // الخطوة 4: إعادة إضافة العمود status
    console.log('📝 الخطوة 4: إضافة عمود status الجديد...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE attendance 
      ADD COLUMN status "AttendanceStatus" NOT NULL DEFAULT 'PRESENT'::"AttendanceStatus"
    `);

    console.log('✅ تم تحديث AttendanceStatus بنجاح!');
    console.log('\n📋 الرموز الجديدة:');
    console.log('  ح: حاضرة (PRESENT)');
    console.log('  م: غائبة بعذر - معتذرة (EXCUSED)');
    console.log('  غ: غائبة بدون عذر (ABSENT)');
    console.log('  ر: راجعت بدون حضور (REVIEWED)');
    console.log('  خ: خروج مبكر (LEFT_EARLY)');

  } catch (error) {
    console.error('❌ خطأ في تحديث AttendanceStatus:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
updateAttendanceStatus()
  .then(() => {
    console.log('\n✅ اكتملت عملية التحديث بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 فشلت عملية التحديث:', error);
    process.exit(1);
  });
