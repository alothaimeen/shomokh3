const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 فحص المستخدمين والطالبات...\n');

    const users = await prisma.user.findMany({
      where: { userRole: 'STUDENT' },
      select: {
        id: true,
        userName: true,
        userEmail: true,
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
          },
        },
      },
    });

    console.log(`📊 عدد حسابات الطالبات: ${users.length}\n`);

    users.forEach(user => {
      console.log(`- ${user.userEmail}`);
      console.log(`  الاسم: ${user.userName}`);
      console.log(`  مربوط بطالبة: ${user.student ? `نعم (${user.student.studentName})` : 'لا'}\n`);
    });

    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentName: true,
        studentNumber: true,
        userId: true,
      },
    });

    console.log(`📊 عدد الطالبات في جدول Student: ${students.length}\n`);

    students.forEach(student => {
      console.log(`- م${student.studentNumber}: ${student.studentName}`);
      console.log(`  userId: ${student.userId || 'غير مربوط'}\n`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
