const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixPasswords() {
  try {
    console.log('🔐 إصلاح كلمات مرور الطالبات...\n');

    const users = [
      { email: 'student1@shamokh.edu', password: 'student123' },
      { email: 'student2@shamokh.edu', password: 'student123' },
      { email: 'try@try.com', password: 'try123' },
      { email: 'teacher1@shamokh.edu', password: 'teacher123' },
      { email: 'admin@shamokh.edu', password: 'admin123' }
    ];

    for (const account of users) {
      const user = await prisma.user.findUnique({
        where: { userEmail: account.email }
      });

      if (user) {
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
        await prisma.user.update({
          where: { userEmail: account.email },
          data: { passwordHash: hashedPassword }
        });

        console.log(`✅ تم تحديث كلمة مرور: ${account.email}`);
      }
    }

    console.log('\n✅ تم إصلاح جميع كلمات المرور');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();
