const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTeacher() {
  try {
    const user = await prisma.user.findUnique({
      where: { userEmail: 'teacher1@shamokh.edu' },
      include: { courses: true }
    });
    
    console.log('المعلمة:', user?.userName);
    console.log('عدد الحلقات:', user?.courses?.length || 0);
    
    if (user?.courses) {
      user.courses.forEach(c => console.log('  -', c.courseName));
    }
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeacher();
