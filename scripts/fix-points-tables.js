const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBehaviorPointsTable() {
  try {
    console.log('إعادة إنشاء جدول behavior_points بأسماء camelCase...');
    
    // حذف الجدول القديم
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS behavior_points CASCADE`);
    
    // إنشاء جدول جديد بأسماء camelCase
    await prisma.$executeRawUnsafe(`
      CREATE TABLE behavior_points (
        id TEXT PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        "earlyAttendance" BOOLEAN DEFAULT false,
        "perfectMemorization" BOOLEAN DEFAULT false,
        "activeParticipation" BOOLEAN DEFAULT false,
        "timeCommitment" BOOLEAN DEFAULT false,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "studentId" TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE("studentId", "courseId", date)
      )
    `);

    console.log('✅ تم إعادة إنشاء جدول behavior_points');

    // إعادة إنشاء جدول daily_tasks أيضاً
    console.log('إعادة إنشاء جدول daily_tasks بأسماء camelCase...');
    
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS daily_tasks CASCADE`);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE daily_tasks (
        id TEXT PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        "listeningCount" INTEGER DEFAULT 0,
        "repetitionCount" INTEGER DEFAULT 0,
        "recitedToPeer" BOOLEAN DEFAULT false,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "studentId" TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        "courseId" TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE("studentId", "courseId", date)
      )
    `);

    console.log('✅ تم إعادة إنشاء جدول daily_tasks');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBehaviorPointsTable();
