const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function linkExistingStudents() {
  try {
    console.log('🔗 ربط الطالبات الموجودات بحسابات المستخدمين...\n');

    // جلب جميع الطالبات غير المربوطات
    const students = await prisma.student.findMany({
      where: {
        userId: null,
      },
    });

    if (students.length === 0) {
      console.log('✅ جميع الطالبات مربوطات بالفعل');
      return;
    }

    console.log(`📊 عدد الطالبات المطلوب ربطها: ${students.length}\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // إنشاء بريد إلكتروني من رقم الطالبة
        const userEmail = `student${student.studentNumber}@shomokh.edu`;
        const defaultPassword = 'student123'; // كلمة مرور افتراضية
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        // التحقق من عدم وجود المستخدم مسبقاً
        const existingUser = await prisma.user.findUnique({
          where: { userEmail },
        });

        let userId;

        if (existingUser) {
          console.log(`ℹ️  المستخدم ${userEmail} موجود - سيتم الربط فقط`);
          userId = existingUser.id;
        } else {
          // إنشاء حساب مستخدم جديد
          const newUser = await prisma.user.create({
            data: {
              userName: student.studentName,
              userEmail,
              passwordHash,
              userRole: 'STUDENT',
              isActive: true,
            },
          });
          userId = newUser.id;
          console.log(`✅ تم إنشاء حساب: ${userEmail}`);
        }

        // ربط الطالبة بالمستخدم
        await prisma.student.update({
          where: { id: student.id },
          data: { userId },
        });

        console.log(`✅ تم ربط الطالبة: ${student.studentName} (م${student.studentNumber})\n`);
        successCount++;

      } catch (error) {
        console.error(`❌ خطأ في ربط الطالبة ${student.studentName}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 النتائج:');
    console.log(`   ✅ نجح: ${successCount}`);
    console.log(`   ❌ فشل: ${errorCount}`);
    console.log('\n💡 بيانات الدخول الافتراضية:');
    console.log('   البريد الإلكتروني: studentXXX@shomokh.edu (حيث XXX هو رقم الطالبة)');
    console.log('   كلمة المرور: student123');

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

linkExistingStudents();
