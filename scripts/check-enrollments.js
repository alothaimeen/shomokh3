const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnrollments() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: 'course-1',
        isActive: true
      },
      include: {
        student: true,
        course: true
      }
    });
    
    console.log('عدد التسجيلات في course-1:', enrollments.length);
    
    enrollments.forEach(e => {
      console.log(`  - ${e.student.studentName} في ${e.course.courseName}`);
    });
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnrollments();
