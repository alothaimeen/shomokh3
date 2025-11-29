/**
 * سكربت إضافة 29 طالبة لكل حلقة من حلقات teacher1@shamokh.edu
 * الحلقات:
 * - حلقة الفجر - المستوى الأول (برنامج الحفظ المكثف)
 * - حلقة المغرب - المستوى الأول (برنامج التجويد المتقدم)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// 70 يوم تقييم يومي
const START_DATE = new Date('2025-08-31');
const TOTAL_DAILY_GRADES = 70;

function generateDailyGradeDates() {
    const dates = [];
    let currentDate = new Date(START_DATE);
    const endDate = new Date('2025-12-11');
    const autumnBreak = ['2025-11-23', '2025-11-24', '2025-11-25', '2025-11-26', '2025-11-27'];
    
    while (currentDate <= endDate && dates.length < TOTAL_DAILY_GRADES) {
        const day = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (day !== 5 && day !== 6 && !autumnBreak.includes(dateStr)) {
            dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

const DAILY_GRADE_DATES = generateDailyGradeDates();
console.log(`📅 عدد أيام التقييم اليومي: ${DAILY_GRADE_DATES.length}`);

// أسماء طالبات متنوعة
const STUDENT_NAMES = [
    'نورة الفهد', 'هند السعيد', 'رزان الحربي', 'دانة الشهري', 'لمى العمري',
    'أسماء الزهراني', 'منال القرني', 'سلمى الغامدي', 'ريم البقمي', 'هدى الأحمدي',
    'فاطمة المالكي', 'خلود العسيري', 'نوف الخالدي', 'جواهر الحازمي', 'بدور الرشيدي',
    'عبير المهنا', 'أمل الراشد', 'سارة الفيصل', 'مها التميمي', 'وفاء الحمدان',
    'ندى السبيعي', 'رغد الجهني', 'حصة المطيري', 'نجود الدوسري', 'شيماء العنزي',
    'لطيفة الشمري', 'هيفاء القحطاني', 'روان الهاجري', 'ديمة الخثلان'
];

// توزيع الدرجات على 29 طالبة
const PROFILES = [
    // 6 طالبات ممتازات (PERFECT) - درجات كاملة
    'PERFECT', 'PERFECT', 'PERFECT', 'PERFECT', 'PERFECT', 'PERFECT',
    // 8 طالبات متفوقات (EXCELLENT) - 95-99%
    'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT',
    // 8 طالبات جيدات (GOOD) - 80-94%
    'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD',
    // 5 طالبات ضعيفات (WEAK) - 60-79%
    'WEAK', 'WEAK', 'WEAK', 'WEAK', 'WEAK',
    // 2 طالبات راسبات (FAILING) - < 60%
    'FAILING', 'FAILING'
];

function getRandomScore(min, max, decimals = 2) {
    const score = Math.random() * (max - min) + min;
    return parseFloat(score.toFixed(decimals));
}

function shouldAttend(profile) {
    const rates = {
        'PERFECT': 1.0,
        'EXCELLENT': 0.98,
        'GOOD': 0.90,
        'WEAK': 0.80,
        'FAILING': 0.70
    };
    return Math.random() < rates[profile];
}

async function main() {
    console.log('🚀 بدء إضافة 29 طالبة لكل حلقة من حلقات teacher1...');
    const startTime = Date.now();

    // 1. جلب المعلمة
    const teacher = await prisma.user.findUnique({
        where: { userEmail: 'teacher1@shamokh.edu' }
    });
    
    if (!teacher) {
        console.error('❌ المعلمة teacher1@shamokh.edu غير موجودة');
        return;
    }
    console.log(`✅ المعلمة: ${teacher.userName}`);

    // 2. جلب حلقات المعلمة
    const courses = await prisma.course.findMany({
        where: { teacherId: teacher.id },
        include: { program: true }
    });

    console.log(`📚 عدد الحلقات: ${courses.length}`);
    for (const c of courses) {
        const enrollCount = await prisma.enrollment.count({ where: { courseId: c.id } });
        console.log(`  - ${c.courseName} (${c.program.programName}) - ${enrollCount} طالبة حالياً`);
    }

    // 3. إنشاء الطالبات وتسجيلهن
    const defaultPasswordHash = await bcrypt.hash('student123', 10);
    let studentNumber = 2000; // نبدأ من 2000 لتجنب التضارب

    for (const course of courses) {
        console.log(`\n📝 معالجة: ${course.courseName}...`);
        
        const attendanceRecords = [];
        const dailyGrades = [];
        const behaviorGrades = [];
        const behaviorPoints = [];
        const weeklyGrades = [];
        const monthlyGrades = [];
        const finalExams = [];

        for (let i = 0; i < 29; i++) {
            const profile = PROFILES[i];
            const studentName = STUDENT_NAMES[i];
            const email = `student${studentNumber}@test.edu`;

            // إنشاء المستخدم
            const user = await prisma.user.upsert({
                where: { userEmail: email },
                update: {},
                create: {
                    userName: studentName,
                    userEmail: email,
                    passwordHash: defaultPasswordHash,
                    userRole: 'STUDENT'
                }
            });

            // إنشاء الطالبة
            const student = await prisma.student.upsert({
                where: { studentNumber: studentNumber },
                update: {},
                create: {
                    studentName: studentName,
                    studentNumber: studentNumber,
                    userId: user.id,
                    qualification: 'General',
                    nationality: 'Saudi',
                    studentPhone: '0500000000',
                    memorizedAmount: 'None',
                    paymentStatus: 'PAID'
                }
            });

            // التسجيل في الحلقة
            await prisma.enrollment.upsert({
                where: {
                    studentId_courseId: {
                        studentId: student.id,
                        courseId: course.id
                    }
                },
                update: {},
                create: {
                    studentId: student.id,
                    courseId: course.id,
                    enrolledAt: START_DATE
                }
            });

            // توليد الدرجات
            for (const dateIso of DAILY_GRADE_DATES) {
                const isPresent = shouldAttend(profile);

                attendanceRecords.push({
                    studentId: student.id,
                    courseId: course.id,
                    date: new Date(dateIso),
                    status: isPresent ? 'PRESENT' : 'ABSENT'
                });

                if (isPresent) {
                    let dailyScore = 0;
                    if (profile === 'PERFECT') dailyScore = 10;
                    else if (profile === 'EXCELLENT') dailyScore = getRandomScore(9.5, 10);
                    else if (profile === 'GOOD') dailyScore = getRandomScore(8, 9.5);
                    else if (profile === 'WEAK') dailyScore = getRandomScore(6, 8);
                    else dailyScore = getRandomScore(0, 6);

                    dailyGrades.push({
                        studentId: student.id,
                        courseId: course.id,
                        date: new Date(dateIso),
                        memorization: profile === 'PERFECT' ? 5 : dailyScore * 0.5,
                        review: profile === 'PERFECT' ? 5 : dailyScore * 0.5
                    });

                    behaviorGrades.push({
                        studentId: student.id,
                        courseId: course.id,
                        date: new Date(dateIso),
                        dailyScore: 1.00
                    });

                    behaviorPoints.push({
                        studentId: student.id,
                        courseId: course.id,
                        date: new Date(dateIso),
                        earlyAttendance: profile === 'PERFECT' ? true : Math.random() > 0.5,
                        perfectMemorization: profile === 'PERFECT' ? true : dailyScore > 9,
                        activeParticipation: true,
                        timeCommitment: true
                    });
                }
            }

            // الدرجات الأسبوعية (10 أسابيع)
            for (let week = 1; week <= 10; week++) {
                let score = 0;
                if (profile === 'PERFECT') score = 5;
                else if (profile === 'EXCELLENT') score = getRandomScore(4.5, 5);
                else if (profile === 'GOOD') score = getRandomScore(4, 4.5);
                else if (profile === 'WEAK') score = getRandomScore(3, 4);
                else score = getRandomScore(0, 3);

                weeklyGrades.push({
                    studentId: student.id,
                    courseId: course.id,
                    week: week,
                    grade: score
                });
            }

            // الدرجات الشهرية (3 أشهر)
            for (let month = 1; month <= 3; month++) {
                let quranForget, quranMajor, quranMinor, tajweed;
                if (profile === 'PERFECT') {
                    quranForget = 5; quranMajor = 5; quranMinor = 5; tajweed = 15;
                } else if (profile === 'EXCELLENT') {
                    quranForget = getRandomScore(4.5, 5);
                    quranMajor = getRandomScore(4.5, 5);
                    quranMinor = getRandomScore(4.5, 5);
                    tajweed = getRandomScore(13.5, 15);
                } else if (profile === 'GOOD') {
                    quranForget = getRandomScore(4, 4.5);
                    quranMajor = getRandomScore(4, 4.5);
                    quranMinor = getRandomScore(4, 4.5);
                    tajweed = getRandomScore(12, 13.5);
                } else if (profile === 'WEAK') {
                    quranForget = getRandomScore(3, 4);
                    quranMajor = getRandomScore(3, 4);
                    quranMinor = getRandomScore(3, 4);
                    tajweed = getRandomScore(9, 12);
                } else {
                    quranForget = getRandomScore(0, 3);
                    quranMajor = getRandomScore(0, 3);
                    quranMinor = getRandomScore(0, 3);
                    tajweed = getRandomScore(0, 9);
                }

                monthlyGrades.push({
                    studentId: student.id,
                    courseId: course.id,
                    month: month,
                    quranForgetfulness: quranForget,
                    quranMajorMistakes: quranMajor,
                    quranMinorMistakes: quranMinor,
                    tajweedTheory: tajweed
                });
            }

            // الاختبار النهائي
            let quranTest, tajweedTest;
            if (profile === 'PERFECT') {
                quranTest = 40; tajweedTest = 20;
            } else if (profile === 'EXCELLENT') {
                quranTest = getRandomScore(36, 40);
                tajweedTest = getRandomScore(18, 20);
            } else if (profile === 'GOOD') {
                quranTest = getRandomScore(32, 36);
                tajweedTest = getRandomScore(16, 18);
            } else if (profile === 'WEAK') {
                quranTest = getRandomScore(24, 32);
                tajweedTest = getRandomScore(12, 16);
            } else {
                quranTest = getRandomScore(0, 24);
                tajweedTest = getRandomScore(0, 12);
            }

            finalExams.push({
                studentId: student.id,
                courseId: course.id,
                quranTest: quranTest,
                tajweedTest: tajweedTest
            });

            studentNumber++;
        }

        // إدخال البيانات دفعة واحدة
        console.log(`  📊 إدخال ${attendanceRecords.length} سجل حضور...`);
        await prisma.attendance.createMany({ data: attendanceRecords, skipDuplicates: true });
        
        console.log(`  📊 إدخال ${dailyGrades.length} درجة يومية...`);
        await prisma.dailyGrade.createMany({ data: dailyGrades, skipDuplicates: true });
        
        console.log(`  📊 إدخال ${behaviorGrades.length} درجة سلوك...`);
        await prisma.behaviorGrade.createMany({ data: behaviorGrades, skipDuplicates: true });
        
        console.log(`  📊 إدخال ${behaviorPoints.length} نقطة سلوك...`);
        await prisma.behaviorPoint.createMany({ data: behaviorPoints, skipDuplicates: true });
        
        console.log(`  📊 إدخال ${weeklyGrades.length} درجة أسبوعية...`);
        await prisma.weeklyGrade.createMany({ data: weeklyGrades, skipDuplicates: true });
        
        console.log(`  📊 إدخال ${monthlyGrades.length} درجة شهرية...`);
        await prisma.monthlyGrade.createMany({ data: monthlyGrades, skipDuplicates: true });
        
        console.log(`  📊 إدخال ${finalExams.length} اختبار نهائي...`);
        await prisma.finalExam.createMany({ data: finalExams, skipDuplicates: true });

        // التحقق
        const newCount = await prisma.enrollment.count({ where: { courseId: course.id } });
        console.log(`  ✅ ${course.courseName}: ${newCount} طالبة الآن`);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ تم بنجاح في ${duration.toFixed(2)} ثانية!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
