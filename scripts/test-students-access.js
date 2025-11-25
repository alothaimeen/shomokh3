/**
 * سكريبت اختبار: التحقق من الوصول لصفحة /students
 * الهدف: التأكد من أن حساب ADMIN يستطيع الوصول للصفحة
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function testStudentsAccess() {
  try {
    console.log('\n🔍 اختبار الوصول لصفحة /students...\n');
    
    // 1. التحقق من وجود مستخدم ADMIN
    const adminUsers = await db.user.findMany({
      where: { userRole: 'ADMIN', isActive: true }
    });
    
    console.log(`✅ عدد المدراء النشطين: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('\n❌ لا يوجد مدراء نشطين! إنشاء حساب admin تجريبي...\n');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await db.user.create({
        data: {
          userName: 'مديرة المنصة',
          userEmail: 'admin@shamokh.edu',
          passwordHash: hashedPassword,
          userRole: 'ADMIN',
          isActive: true
        }
      });
      
      console.log(`✅ تم إنشاء حساب Admin: ${newAdmin.userEmail}`);
      console.log(`   كلمة المرور: admin123\n`);
    } else {
      console.log('\n📋 المدراء المتاحون:\n');
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.userName} (${admin.userEmail})`);
      });
    }
    
    // 2. التحقق من وجود طالبات
    const studentsCount = await db.student.count();
    console.log(`\n📊 عدد الطالبات في النظام: ${studentsCount}`);
    
    if (studentsCount === 0) {
      console.log('⚠️  لا توجد طالبات في النظام');
    }
    
    // 3. اختبار الاستعلام الذي تستخدمه صفحة /students
    console.log('\n🔍 اختبار الاستعلام الأساسي للصفحة...');
    const testQuery = await db.student.findMany({
      orderBy: { studentNumber: 'asc' },
      select: {
        id: true,
        studentNumber: true,
        studentName: true,
        qualification: true,
        nationality: true,
        studentPhone: true,
        memorizedAmount: true,
        paymentStatus: true,
        memorizationPlan: true,
        notes: true,
        isActive: true,
        createdAt: true
      },
      take: 5
    });
    
    console.log(`✅ تم جلب ${testQuery.length} طالبات بنجاح`);
    
    if (testQuery.length > 0) {
      console.log('\n📋 عينة من الطالبات:');
      testQuery.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.studentName} (رقم: ${student.studentNumber})`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ الاختبار اكتمل بنجاح!');
    console.log('='.repeat(60));
    
    console.log('\n📝 خطوات التجربة:');
    console.log('   1. افتح http://localhost:3000/login');
    console.log('   2. سجل دخول بحساب ADMIN (راجع القائمة أعلاه)');
    console.log('   3. انتقل إلى /students');
    console.log('   4. راقب console.log في Terminal\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await db.$disconnect();
  }
}

testStudentsAccess();
