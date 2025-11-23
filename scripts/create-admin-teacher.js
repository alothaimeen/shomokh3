const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

async function createUsers() {
  try {
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    const hashedTeacherPass = await bcrypt.hash('teacher123', 10);
    
    // إنشاء Admin
    const admin = await db.user.upsert({
      where: { userEmail: 'admin@shamokh.edu' },
      update: { passwordHash: hashedAdminPass, isActive: true },
      create: {
        userEmail: 'admin@shamokh.edu',
        userName: 'المشرفة العامة',
        passwordHash: hashedAdminPass,
        userRole: 'ADMIN',
        isActive: true
      }
    });
    console.log('✅ تم إنشاء/تحديث حساب Admin:', admin.userEmail);
    
    // إنشاء Teacher
    const teacher = await db.user.upsert({
      where: { userEmail: 'teacher1@shamokh.edu' },
      update: { passwordHash: hashedTeacherPass, isActive: true },
      create: {
        userEmail: 'teacher1@shamokh.edu',
        userName: 'المعلمة نورة',
        passwordHash: hashedTeacherPass,
        userRole: 'TEACHER',
        isActive: true
      }
    });
    console.log('✅ تم إنشاء/تحديث حساب Teacher:', teacher.userEmail);
    
    // التحقق
    const allUsers = await db.user.findMany({
      select: { userEmail: true, userName: true, userRole: true, isActive: true }
    });
    
    console.log('\n📋 جميع المستخدمين في قاعدة البيانات:');
    allUsers.forEach(u => {
      console.log(`- ${u.userEmail} (${u.userRole}) - نشط: ${u.isActive}`);
    });
    
    console.log('\n🔑 بيانات تسجيل الدخول:');
    console.log('Admin: admin@shamokh.edu / admin123');
    console.log('Teacher: teacher1@shamokh.edu / teacher123');
    console.log('Student: student1@shamokh.edu / student123');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await db.$disconnect();
  }
}

createUsers();
