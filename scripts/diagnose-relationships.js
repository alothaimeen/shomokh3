// Diagnose database relationships (Session 17.6)
// الغرض: فحص علاقات User -> Course و User -> Student

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('\n🔍 فحص علاقات قاعدة البيانات...\n');

  try {
    // 1. جلب جميع المستخدمين
    console.log('📋 المستخدمون:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userName: true,
        userEmail: true,
        userRole: true,
      },
    });
    
    console.table(users);
    
    // 2. جلب جميع الحلقات
    console.log('\n📚 الحلقات:');
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        courseName: true,
        teacherId: true,
      },
    });
    
    console.table(courses);
    
    // 3. جلب جميع الطالبات
    console.log('\n👩‍🎓 الطالبات:');
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentName: true,
        studentNumber: true,
        userId: true,
      },
    });
    
    console.table(students);
    
    // 4. فحص العلاقات
    console.log('\n🔗 تحليل العلاقات:\n');
    
    // معلمات
    const teachers = users.filter(u => u.userRole === 'TEACHER');
    console.log(`عدد المعلمات: ${teachers.length}`);
    
    for (const teacher of teachers) {
      const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
      console.log(`\n👩‍🏫 ${teacher.userName} (${teacher.userEmail})`);
      console.log(`   User.id: ${teacher.id}`);
      console.log(`   عدد الحلقات المرتبطة: ${teacherCourses.length}`);
      if (teacherCourses.length > 0) {
        teacherCourses.forEach(c => {
          console.log(`   - ${c.courseName} (${c.id})`);
        });
      }
    }
    
    // حلقات غير مرتبطة
    const orphanCourses = courses.filter(c => 
      !teachers.some(t => t.id === c.teacherId)
    );
    
    if (orphanCourses.length > 0) {
      console.log('\n⚠️  حلقات غير مرتبطة بمعلمة:');
      orphanCourses.forEach(c => {
        console.log(`   - ${c.courseName} (teacherId: ${c.teacherId})`);
      });
    }
    
    // طالبات
    const studentUsers = users.filter(u => u.userRole === 'STUDENT');
    console.log(`\n\nعدد حسابات الطالبات: ${studentUsers.length}`);
    console.log(`عدد سجلات Student: ${students.length}`);
    
    for (const studentUser of studentUsers) {
      const linkedStudent = students.find(s => s.userId === studentUser.id);
      console.log(`\n👩‍🎓 ${studentUser.userName} (${studentUser.userEmail})`);
      console.log(`   User.id: ${studentUser.id}`);
      if (linkedStudent) {
        console.log(`   ✅ مرتبطة بـ Student.id: ${linkedStudent.id}`);
        console.log(`   اسم الطالبة: ${linkedStudent.studentName}`);
        console.log(`   رقم القيد: ${linkedStudent.studentNumber}`);
      } else {
        console.log(`   ❌ غير مرتبطة بأي سجل Student`);
      }
    }
    
    // طالبات غير مرتبطة
    const orphanStudents = students.filter(s => 
      !studentUsers.some(u => u.id === s.userId)
    );
    
    if (orphanStudents.length > 0) {
      console.log('\n⚠️  سجلات Student غير مرتبطة بحساب:');
      orphanStudents.forEach(s => {
        console.log(`   - ${s.studentName} (userId: ${s.userId || 'NULL'})`);
      });
    }
    
    console.log('\n✅ انتهى الفحص\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
