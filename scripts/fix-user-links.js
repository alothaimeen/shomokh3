const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserLinks() {
  try {
    console.log('🔧 إصلاح ربط الحسابات...\n');

    // 1. حذف الحسابات الجديدة المكررة
    console.log('🗑️  حذف الحسابات المكررة...');
    await prisma.user.deleteMany({
      where: {
        userEmail: {
          in: ['student1@shomokh.edu', 'student2@shomokh.edu', 'student3@shomokh.edu']
        }
      }
    });
    console.log('✅ تم حذف الحسابات المكررة\n');

    // 2. ربط الطالبات بالحسابات الأصلية
    console.log('🔗 ربط الطالبات بحساباتهن الأصلية...\n');

    // الطالبة فاطمة
    const user1 = await prisma.user.findUnique({
      where: { userEmail: 'student1@shamokh.edu' }
    });
    if (user1) {
      await prisma.student.update({
        where: { studentNumber: 1 },
        data: { userId: user1.id }
      });
      console.log('✅ ربطت الطالبة فاطمة (م1) بـ student1@shamokh.edu');
    }

    // الطالبة عائشة - نحتاج لإنشاء حساب لها
    const user2 = await prisma.user.findUnique({
      where: { userEmail: 'student2@shamokh.edu' }
    });
    let user2Id;
    if (!user2) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('student123', 10);
      const newUser = await prisma.user.create({
        data: {
          userName: 'عائشة سالم علي',
          userEmail: 'student2@shamokh.edu',
          passwordHash,
          userRole: 'STUDENT',
          isActive: true,
        }
      });
      user2Id = newUser.id;
      console.log('✅ أنشأت حساب لعائشة: student2@shamokh.edu');
    } else {
      user2Id = user2.id;
    }
    
    await prisma.student.update({
      where: { studentNumber: 2 },
      data: { userId: user2Id }
    });
    console.log('✅ ربطت الطالبة عائشة (م2) بحسابها');

    // الطالبة try
    const user3 = await prisma.user.findUnique({
      where: { userEmail: 'try@try.com' }
    });
    if (user3) {
      await prisma.student.update({
        where: { studentNumber: 3 },
        data: { userId: user3.id }
      });
      console.log('✅ ربطت الطالبة try (م3) بـ try@try.com');
    }

    console.log('\n✅ تم إصلاح جميع الروابط');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserLinks();
