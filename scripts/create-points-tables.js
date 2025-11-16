const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('إنشاء جدول daily_tasks...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS daily_tasks (
        id TEXT PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        listening_count INTEGER DEFAULT 0,
        repetition_count INTEGER DEFAULT 0,
        recited_to_peer BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id, date)
      )
    `);

    console.log('إنشاء جدول behavior_points...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS behavior_points (
        id TEXT PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        early_attendance BOOLEAN DEFAULT false,
        perfect_memorization BOOLEAN DEFAULT false,
        active_participation BOOLEAN DEFAULT false,
        time_commitment BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id, date)
      )
    `);

    console.log('✅ تم إنشاء الجداول بنجاح');
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
