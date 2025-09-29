// 🔧 سكريبت إعداد قاعدة البيانات - منصة شموخ v3
// يستخدم هذا السكريبت لإعداد قاعدة البيانات مع البيانات الأولية

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// البيانات الأولية للمستخدمين (حسب البرومبت)
const testUsers = [
  {
    id: "admin-1",
    userName: "الآدمن",
    userEmail: "admin@shamokh.edu",
    passwordHash: "$2a$10$example.hash.admin123", // يجب تشفيرها باستخدام bcrypt
    userRole: "ADMIN"
  },
  {
    id: "teacher-1",
    userName: "المعلمة سارة",
    userEmail: "teacher1@shamokh.edu",
    passwordHash: "$2a$10$example.hash.teacher123",
    userRole: "TEACHER"
  },
  {
    id: "student-1",
    userName: "الطالبة فاطمة",
    userEmail: "student1@shamokh.edu",
    passwordHash: "$2a$10$example.hash.student123",
    userRole: "STUDENT"
  }
];

// البيانات الأولية للبرامج
const testPrograms = [
  {
    id: "prog-1",
    programName: "برنامج الحفظ المكثف",
    programDescription: "برنامج شامل لحفظ القرآن الكريم مع التجويد"
  },
  {
    id: "prog-2",
    programName: "برنامج التجويد المتقدم",
    programDescription: "برنامج متخصص في قواعد التجويد وتطبيقها"
  }
];

// البيانات الأولية للحلقات
const testCourses = [
  {
    id: "course-1",
    courseName: "حلقة الفجر - المستوى الأول",
    courseDescription: "حلقة تحفيظ القرآن الكريم مع أساسيات التجويد",
    syllabus: "من الفاتحة إلى نهاية جزء عم",
    level: 1,
    maxStudents: 20,
    programId: "prog-1",
    teacherId: "teacher-1"
  },
  {
    id: "course-2",
    courseName: "حلقة المغرب - المستوى الأول",
    courseDescription: "حلقة تحفيظ مع مراجعة وتركيز على التجويد",
    syllabus: "من سورة البقرة إلى سورة النساء",
    level: 1,
    maxStudents: 15,
    programId: "prog-2",
    teacherId: "teacher-1"
  }
];

// البيانات الأولية للطالبات
const testStudents = [
  {
    id: "std-1",
    studentNumber: 1,
    studentName: "فاطمة أحمد محمد",
    qualification: "ثانوية عامة",
    nationality: "سعودية",
    studentPhone: "0501234567",
    memorizedAmount: "جزء عم",
    paymentStatus: "PAID",
    memorizationPlan: "إكمال 5 أجزاء في السنة",
    notes: "طالبة متميزة ونشطة"
  },
  {
    id: "std-2",
    studentNumber: 2,
    studentName: "عائشة سالم علي",
    qualification: "جامعية",
    nationality: "سعودية",
    studentPhone: "0507654321",
    memorizedAmount: "3 أجزاء",
    paymentStatus: "UNPAID",
    memorizationPlan: "إكمال 10 أجزاء في سنتين",
    notes: null
  }
];

async function setupDatabase() {
  try {
    console.log('🚀 بدء إعداد قاعدة البيانات...');

    // 1. تنظيف البيانات الموجودة (اختياري)
    console.log('🧹 تنظيف البيانات القديمة...');
    await prisma.attendance.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.enrollmentRequest.deleteMany();
    await prisma.student.deleteMany();
    await prisma.course.deleteMany();
    await prisma.program.deleteMany();
    await prisma.user.deleteMany();

    // 2. إضافة المستخدمين
    console.log('👥 إضافة المستخدمين...');
    for (const user of testUsers) {
      await prisma.user.create({ data: user });
      console.log(`   ✅ تم إضافة ${user.userName}`);
    }

    // 3. إضافة البرامج
    console.log('📚 إضافة البرامج...');
    for (const program of testPrograms) {
      await prisma.program.create({ data: program });
      console.log(`   ✅ تم إضافة ${program.programName}`);
    }

    // 4. إضافة الحلقات
    console.log('🎓 إضافة الحلقات...');
    for (const course of testCourses) {
      await prisma.course.create({ data: course });
      console.log(`   ✅ تم إضافة ${course.courseName}`);
    }

    // 5. إضافة الطالبات
    console.log('👩‍🎓 إضافة الطالبات...');
    for (const student of testStudents) {
      await prisma.student.create({ data: student });
      console.log(`   ✅ تم إضافة ${student.studentName}`);
    }

    // 6. إضافة بعض التسجيلات التجريبية
    console.log('📝 إضافة التسجيلات التجريبية...');
    await prisma.enrollment.create({
      data: {
        studentId: "std-1",
        courseId: "course-1"
      }
    });
    console.log('   ✅ تم تسجيل فاطمة في حلقة الفجر');

    // 7. إضافة بعض سجلات الحضور التجريبية
    console.log('📊 إضافة سجلات حضور تجريبية...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.attendance.createMany({
      data: [
        {
          studentId: "std-1",
          courseId: "course-1",
          date: today,
          status: "PRESENT",
          notes: "حضرت في الوقت المحدد"
        },
        {
          studentId: "std-1",
          courseId: "course-1",
          date: yesterday,
          status: "LATE",
          notes: "تأخرت 10 دقائق"
        }
      ]
    });
    console.log('   ✅ تم إضافة سجلات الحضور');

    console.log('🎉 تم إعداد قاعدة البيانات بنجاح!');
    console.log('\n📋 ملخص البيانات المضافة:');
    console.log(`   - ${testUsers.length} مستخدمين`);
    console.log(`   - ${testPrograms.length} برامج`);
    console.log(`   - ${testCourses.length} حلقات`);
    console.log(`   - ${testStudents.length} طالبات`);
    console.log('   - 1 تسجيل في الحلقة');
    console.log('   - 2 سجل حضور');

  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };