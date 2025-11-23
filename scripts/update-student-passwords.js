const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

async function updateStudentPasswords() {
  try {
    const hashedPass = await bcrypt.hash('student123', 10);
    
    const result = await db.user.updateMany({
      where: { userRole: 'STUDENT' },
      data: { 
        passwordHash: hashedPass,
        isActive: true 
      }
    });
    
    console.log('✅ تم تحديث كلمات مرور', result.count, 'طالبة');
    console.log('🔑 كلمة المرور الجديدة: student123');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await db.$disconnect();
  }
}

updateStudentPasswords();
