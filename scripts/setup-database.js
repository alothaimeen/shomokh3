// 🔧 سكريبت إعداد قاعدة البيانات - منصة شموخ v3
// ⚠️⚠️⚠️ تحذير هام ⚠️⚠️⚠️
// هذا السكريبت يحذف جميع البيانات الموجودة في قاعدة البيانات!
// استخدمه فقط في بيئة التطوير أو لإعادة تهيئة قاعدة البيانات
// ⚠️⚠️⚠️ لا تشغله على بيانات حقيقية ⚠️⚠️⚠️

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
    studentName: "الطالبة فاطمة", // يطابق userName في حساب student1
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
    console.log('\n⚠️⚠️⚠️ تحذير هام ⚠️⚠️⚠️');
    console.log('هذا السكريبت سيحذف جميع البيانات الموجودة في قاعدة البيانات!');
    console.log('بما في ذلك: المستخدمين، الحلقات، الطالبات، الدرجات، الحضور، وجميع البيانات الأخرى');
    console.log('⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n');
    
    console.log('🚀 بدء إعداد قاعدة البيانات...');

    // 1. تنظيف البيانات الموجودة (مع الاحتفاظ ببيانات الطالبة فاطمة)
    console.log('🧹 تنظيف البيانات القديمة (مع الاحتفاظ ببيانات الطالبة فاطمة)...');
    
    // البحث عن معرف الطالبة فاطمة
    const fatimaUser = await prisma.user.findUnique({
      where: { userEmail: 'student1@shamokh.edu' }
    });
    const fatimaStudentId = fatimaUser?.id;
    
    if (fatimaStudentId) {
      console.log(`   ℹ️  تم العثور على الطالبة فاطمة (${fatimaStudentId}) - سيتم الاحتفاظ ببياناتها`);
      
      // حذف البيانات عدا بيانات فاطمة
      await prisma.attendance.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.behaviorGrade.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.finalExam.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.monthlyGrade.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.weeklyGrade.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.dailyGrade.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.enrollment.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.enrollmentRequest.deleteMany({
        where: { studentId: { not: fatimaStudentId } }
      });
      await prisma.student.deleteMany({
        where: { id: { not: fatimaStudentId } }
      });
    } else {
      console.log('   ℹ️  لم يتم العثور على الطالبة فاطمة - سيتم حذف جميع الطالبات');
      await prisma.attendance.deleteMany();
      await prisma.behaviorGrade.deleteMany();
      await prisma.finalExam.deleteMany();
      await prisma.monthlyGrade.deleteMany();
      await prisma.weeklyGrade.deleteMany();
      await prisma.dailyGrade.deleteMany();
      await prisma.enrollment.deleteMany();
      await prisma.enrollmentRequest.deleteMany();
      await prisma.student.deleteMany();
    }
    
    // حذف البيانات الأخرى بالكامل
    await prisma.course.deleteMany();
    await prisma.program.deleteMany();
    await prisma.user.deleteMany({
      where: { userEmail: { not: 'student1@shamokh.edu' } }
    });
    console.log('   ✅ تم حذف البيانات القديمة مع الاحتفاظ ببيانات الطالبة فاطمة');

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

    // 6. إضافة تسجيلات تجريبية
    console.log('📝 إضافة تسجيلات الطالبات في الحلقات...');
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: "std-1",
        courseId: "course-1"
      }
    });
    console.log('   ✅ تم تسجيل الطالبة فاطمة في حلقة الفجر');

    // 7. إضافة درجات يومية عشوائية (70 يوم)
    console.log('📝 إضافة درجات يومية عشوائية (70 يوم)...');
    const dailyGradesData = [];
    const startDate = new Date('2025-09-01');
    for (let i = 0; i < 70; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // درجات عشوائية متنوعة (0-5 بفارق 0.25)
      const memorizationGrades = [5, 4.75, 4.5, 4.25, 4, 3.75, 3.5, 3, 2.5];
      const reviewGrades = [5, 4.75, 4.5, 4, 3.75, 3.5, 3, 2.75, 2.5];
      
      dailyGradesData.push({
        studentId: "std-1",
        courseId: "course-1",
        date: date,
        memorization: memorizationGrades[Math.floor(Math.random() * memorizationGrades.length)],
        review: reviewGrades[Math.floor(Math.random() * reviewGrades.length)]
      });
    }
    await prisma.dailyGrade.createMany({ data: dailyGradesData });
    console.log('   ✅ تم إضافة 70 درجة يومية');

    // 8. إضافة درجات أسبوعية (10 أسابيع)
    console.log('📝 إضافة درجات أسبوعية (10 أسابيع)...');
    const weeklyGradesData = [];
    const weekGrades = [5, 4.75, 4.5, 4.25, 4, 3.75, 3.5, 3.25, 3];
    for (let week = 1; week <= 10; week++) {
      weeklyGradesData.push({
        studentId: "std-1",
        courseId: "course-1",
        week: week,
        grade: weekGrades[Math.floor(Math.random() * weekGrades.length)]
      });
    }
    await prisma.weeklyGrade.createMany({ data: weeklyGradesData });
    console.log('   ✅ تم إضافة 10 درجات أسبوعية');

    // 9. إضافة درجات شهرية (3 أشهر)
    console.log('📝 إضافة درجات شهرية (3 أشهر)...');
    const monthlyGradesData = [];
    for (let month = 1; month <= 3; month++) {
      monthlyGradesData.push({
        studentId: "std-1",
        courseId: "course-1",
        month: month,
        quranForgetfulness: [5, 4.75, 4.5, 4.25, 4][Math.floor(Math.random() * 5)],
        quranMajorMistakes: [5, 4.75, 4.5, 4.25, 4, 3.75][Math.floor(Math.random() * 6)],
        quranMinorMistakes: [5, 4.75, 4.5, 4, 3.75, 3.5][Math.floor(Math.random() * 6)],
        tajweedTheory: [15, 14.5, 14, 13.5, 13, 12.5, 12][Math.floor(Math.random() * 7)]
      });
    }
    await prisma.monthlyGrade.createMany({ data: monthlyGradesData });
    console.log('   ✅ تم إضافة 3 درجات شهرية');

    // 10. إضافة درجات السلوك (70 يوم)
    console.log('📝 إضافة درجات السلوك (70 يوم)...');
    const behaviorGradesData = [];
    const behaviorScores = [1, 0.75, 0.5, 0.25];
    for (let i = 0; i < 70; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      behaviorGradesData.push({
        studentId: "std-1",
        courseId: "course-1",
        date: date,
        dailyScore: behaviorScores[Math.floor(Math.random() * behaviorScores.length)]
      });
    }
    await prisma.behaviorGrade.createMany({ data: behaviorGradesData });
    console.log('   ✅ تم إضافة 70 درجة سلوك');

    // 11. إضافة الاختبار النهائي
    console.log('📝 إضافة الاختبار النهائي...');
    await prisma.finalExam.create({
      data: {
        studentId: "std-1",
        courseId: "course-1",
        quranTest: [40, 38, 36, 35, 34, 32][Math.floor(Math.random() * 6)],
        tajweedTest: [20, 19, 18, 17, 16][Math.floor(Math.random() * 5)]
      }
    });
    console.log('   ✅ تم إضافة الاختبار النهائي');

    // 12. إضافة بعض سجلات الحضور التجريبية
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
          status: "EXCUSED",
          notes: "غابت بعذر"
        }
      ]
    });
    console.log('   ✅ تم إضافة سجلات الحضور');

    console.log('\n🎉 تم إعداد قاعدة البيانات بنجاح!');
    console.log('\n📋 ملخص البيانات المضافة:');
    console.log(`   - ${testUsers.length} مستخدمين`);
    console.log(`   - ${testPrograms.length} برامج`);
    console.log(`   - ${testCourses.length} حلقات`);
    console.log(`   - ${testStudents.length} طالبات`);
    console.log('   - 1 enrollment (تسجيل)');
    console.log('   - 70 درجة يومية');
    console.log('   - 10 درجات أسبوعية');
    console.log('   - 3 درجات شهرية');
    console.log('   - 70 درجة سلوك');
    console.log('   - 1 اختبار نهائي');
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