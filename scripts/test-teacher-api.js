// Test Teacher API (Session 17.6)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTeacherAPI() {
  console.log('\n🧪 اختبار Teacher API...\n');

  try {
    // محاكاة session.user.id للمعلمة
    const teacherUserId = 'teacher-1';
    
    console.log(`📌 المعلمة User.id: ${teacherUserId}\n`);
    
    // محاكاة API logic من /api/courses/teacher-courses
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacherUserId, // هذا ما يبحث به API الآن
      },
      select: {
        id: true,
        courseName: true,
        courseDescription: true,
        maxStudents: true,
        level: true,
        programId: true,
        teacherId: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    console.log(`✅ النتيجة: ${courses.length} حلقة\n`);
    
    if (courses.length > 0) {
      console.log('📚 الحلقات المرتبطة:');
      courses.forEach((course, idx) => {
        console.log(`\n${idx + 1}. ${course.courseName}`);
        console.log(`   ID: ${course.id}`);
        console.log(`   Teacher ID: ${course.teacherId}`);
        console.log(`   عدد الطالبات: ${course._count.enrollments}`);
      });
    } else {
      console.log('⚠️  لا توجد حلقات مرتبطة!');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTeacherAPI();
