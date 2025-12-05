/**
 * سكربت محاكاة البيانات السريع (Fast Simulation Seeder)
 * ======================================================
 * يُنشئ معلمات وطالبات وحلقات مع درجات كاملة للفصل الدراسي
 * 
 * المميزات:
 * - سرعة عالية: createMany مع skipDuplicates
 * - بيانات متنوعة: مؤهلات، جنسيات، حفظ، سداد
 * - teacher1@shamokh.edu للتجربة
 * 
 * Usage: node scripts/seed_simulation.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ==================== CONFIGURATION ====================

const CONFIG = {
    START_DATE: new Date('2025-08-31'),
    TOTAL_DAILY_GRADES: 70,
    AUTUMN_BREAK: ['2025-11-23', '2025-11-24', '2025-11-25', '2025-11-26', '2025-11-27'],
    END_DATE: new Date('2025-12-11'),
    TEACHER_PASSWORD: 'teacher123',
    STUDENT_PASSWORD: 'student123',
    STUDENTS_PER_COURSE: 30,
    BATCH_SIZE: 1000
};

// ==================== DIVERSITY DATA ====================

const QUALIFICATIONS = {
    general: ['ثانوي', 'متوسط', 'ابتدائي', 'جامعي'],
    advanced: ['جامعي', 'ماجستير']
};

const NATIONALITIES = [
    'سعودية', 'سعودية', 'سعودية', 'سعودية', 'سعودية',
    'سعودية', 'سعودية', 'سعودية',
    'يمنية', 'سورية', 'مصرية', 'أردنية', 'فلسطينية'
];

const MEMORIZATION_AMOUNTS = [
    'جزء عم', 'جزء تبارك', '3 أجزاء', '5 أجزاء',
    '10 أجزاء', '15 جزء', '20 جزء', 'حافظة كاملة'
];

const PAYMENT_STATUSES = [
    'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID', 'PAID',
    'UNPAID', 'UNPAID',
    'PARTIAL'
];

const STUDENT_NAMES = [
    'نورة الفهد', 'هند السعيد', 'رزان الحربي', 'دانة الشهري', 'لمى العمري',
    'أسماء الزهراني', 'منال القرني', 'سلمى الغامدي', 'ريم البقمي', 'هدى الأحمدي',
    'فاطمة المالكي', 'خلود العسيري', 'نوف الخالدي', 'جواهر الحازمي', 'بدور الرشيدي',
    'عبير المهنا', 'أمل الراشد', 'سارة الفيصل', 'مها التميمي', 'وفاء الحمدان',
    'ندى السبيعي', 'رغد الجهني', 'حصة المطيري', 'نجود الدوسري', 'شيماء العنزي',
    'لطيفة الشمري', 'هيفاء القحطاني', 'روان الهاجري', 'ديمة الخثلان', 'غادة العتيبي'
];

const PROFILES = [
    'PERFECT', 'PERFECT', 'PERFECT', 'PERFECT', 'PERFECT', 'PERFECT',
    'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT',
    'EXCELLENT', 'EXCELLENT', 'EXCELLENT', 'EXCELLENT',
    'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD',
    'WEAK', 'WEAK', 'WEAK', 'WEAK',
    'FAILING', 'FAILING'
];

// ==================== TEACHERS DATA ====================

const TEACHERS = [
    {
        name: 'المعلمة التجريبية',
        email: 'teacher1@shamokh.edu',
        courses: [
            { name: 'حلقة الفجر - المستوى الأول', program: 'برنامج الحفظ المكثف' },
            { name: 'حلقة المغرب - المستوى الأول', program: 'برنامج التجويد المتقدم' }
        ]
    },
    {
        name: 'سارة الأحمد',
        email: 'teacher2@shamokh.edu',
        courses: [
            { name: 'حلقة الضحى - المستوى الثاني', program: 'برنامج الحفظ المكثف' },
            { name: 'حلقة العصر - المستوى الأول', program: 'برنامج المراجعة' }
        ]
    },
    {
        name: 'فاطمة المالكي',
        email: 'teacher3@shamokh.edu',
        courses: [
            { name: 'حلقة الظهر - المتقدمات', program: 'برنامج المراحل العليا' }
        ]
    },
    {
        name: 'نورة القحطاني',
        email: 'teacher4@shamokh.edu',
        courses: [
            { name: 'حلقة المبتدئات - الأحد', program: 'برنامج المبتدئات' },
            { name: 'حلقة المبتدئات - الثلاثاء', program: 'برنامج المبتدئات' }
        ]
    }
];

// ==================== UTILITIES ====================

function chunk(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomScore(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function shouldAttend(profile) {
    const rates = { 'PERFECT': 1.0, 'EXCELLENT': 0.98, 'GOOD': 0.90, 'WEAK': 0.80, 'FAILING': 0.70 };
    return Math.random() < rates[profile];
}

function getQualification(programName) {
    const isAdvanced = programName.includes('المراحل العليا') ||
        programName.includes('المتقدمات') ||
        programName.includes('التجويد المتقدم');
    return getRandomItem(isAdvanced ? QUALIFICATIONS.advanced : QUALIFICATIONS.general);
}

function generateDailyDates() {
    const dates = [];
    let currentDate = new Date(CONFIG.START_DATE);
    while (currentDate <= CONFIG.END_DATE && dates.length < CONFIG.TOTAL_DAILY_GRADES) {
        const day = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];
        if (day !== 5 && day !== 6 && !CONFIG.AUTUMN_BREAK.includes(dateStr)) {
            dates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

function getScores(profile) {
    const s = {
        'PERFECT': { d: 10, w: 5, mQ: 5, mT: 15, fQ: 40, fT: 20 },
        'EXCELLENT': { d: () => getRandomScore(9.5, 10), w: () => getRandomScore(4.5, 5), mQ: () => getRandomScore(4.5, 5), mT: () => getRandomScore(13.5, 15), fQ: () => getRandomScore(36, 40), fT: () => getRandomScore(18, 20) },
        'GOOD': { d: () => getRandomScore(8, 9.5), w: () => getRandomScore(4, 4.5), mQ: () => getRandomScore(4, 4.5), mT: () => getRandomScore(12, 13.5), fQ: () => getRandomScore(32, 36), fT: () => getRandomScore(16, 18) },
        'WEAK': { d: () => getRandomScore(6, 8), w: () => getRandomScore(3, 4), mQ: () => getRandomScore(3, 4), mT: () => getRandomScore(9, 12), fQ: () => getRandomScore(24, 32), fT: () => getRandomScore(12, 16) },
        'FAILING': { d: () => getRandomScore(0, 6), w: () => getRandomScore(0, 3), mQ: () => getRandomScore(0, 3), mT: () => getRandomScore(0, 9), fQ: () => getRandomScore(0, 24), fT: () => getRandomScore(0, 12) }
    };
    return s[profile];
}

function val(v) { return typeof v === 'function' ? v() : v; }

async function batchInsert(model, data, label) {
    if (!data.length) return 0;
    const chunks_arr = chunk(data, CONFIG.BATCH_SIZE);
    let total = 0;
    for (const [i, batch] of chunks_arr.entries()) {
        const result = await prisma[model].createMany({ data: batch, skipDuplicates: true });
        total += result.count;
        if ((i + 1) % 5 === 0 || i === chunks_arr.length - 1) {
            process.stdout.write(`\r  ${label}: ${Math.min((i + 1) * CONFIG.BATCH_SIZE, data.length)}/${data.length}`);
        }
    }
    console.log(`\r  ✅ ${label}: ${total}/${data.length}                    `);
    return total;
}

// ==================== MAIN ====================

async function main() {
    console.log('\n🚀 بدء محاكاة البيانات السريعة...\n');
    const startTime = Date.now();
    const DAILY_DATES = generateDailyDates();
    console.log(`📅 أيام التقييم: ${DAILY_DATES.length}`);

    const teacherPasswordHash = await bcrypt.hash(CONFIG.TEACHER_PASSWORD, 10);
    const studentPasswordHash = await bcrypt.hash(CONFIG.STUDENT_PASSWORD, 10);

    // ==================== PHASE 1: Structure (Sequential - Small) ====================
    console.log('\n📦 المرحلة 1: إنشاء الهيكل...');

    const programIds = new Map();
    const courseData = [];
    const teacherIds = new Map();

    // Create teachers
    for (const t of TEACHERS) {
        const teacher = await prisma.user.upsert({
            where: { userEmail: t.email },
            update: {},
            create: { userName: t.name, userEmail: t.email, passwordHash: teacherPasswordHash, userRole: 'TEACHER' }
        });
        teacherIds.set(t.email, teacher.id);
        console.log(`  ✅ ${t.name}`);

        // Create programs and courses
        for (const c of t.courses) {
            let programId = programIds.get(c.program);
            if (!programId) {
                let prog = await prisma.program.findFirst({ where: { programName: c.program } });
                if (!prog) {
                    prog = await prisma.program.create({ data: { programName: c.program, programDescription: `وصف ${c.program}` } });
                }
                programId = prog.id;
                programIds.set(c.program, programId);
            }

            let course = await prisma.course.findFirst({ where: { courseName: c.name, programId } });
            if (!course) {
                course = await prisma.course.create({
                    data: { courseName: c.name, programId, teacherId: teacher.id, maxStudents: CONFIG.STUDENTS_PER_COURSE }
                });
            }
            courseData.push({ id: course.id, programName: c.program, teacherEmail: t.email });
            console.log(`     📚 ${c.name}`);
        }
    }

    // ==================== PHASE 2: Generate All Data in Memory ====================
    console.log('\n📊 المرحلة 2: توليد البيانات...');

    const users = [];
    const students = [];
    const enrollments = [];
    const attendance = [];
    const dailyGrades = [];
    const behaviorGrades = [];
    const behaviorPoints = [];
    const weeklyGrades = [];
    const monthlyGrades = [];
    const finalExams = [];

    let studentNumber = 5000; // Start from 5000 to avoid conflicts

    for (const course of courseData) {
        for (let i = 0; i < CONFIG.STUDENTS_PER_COURSE; i++) {
            const profile = PROFILES[i % PROFILES.length];
            const studentName = STUDENT_NAMES[i % STUDENT_NAMES.length];
            const email = `sim${studentNumber}@test.edu`;
            const odId = `sim-user-${studentNumber}`;
            const osId = `sim-student-${studentNumber}`;

            // User
            users.push({
                id: odId,
                userName: studentName,
                userEmail: email,
                passwordHash: studentPasswordHash,
                userRole: 'STUDENT',
                isActive: true
            });

            // Student
            students.push({
                id: osId,
                studentNumber,
                studentName,
                userId: odId,
                qualification: getQualification(course.programName),
                nationality: getRandomItem(NATIONALITIES),
                studentPhone: `050${Math.floor(1000000 + Math.random() * 9000000)}`,
                memorizedAmount: getRandomItem(MEMORIZATION_AMOUNTS),
                paymentStatus: getRandomItem(PAYMENT_STATUSES),
                isActive: true
            });

            // Enrollment
            enrollments.push({
                studentId: osId,
                courseId: course.id,
                enrolledAt: CONFIG.START_DATE,
                isActive: true
            });

            const scores = getScores(profile);

            // Daily data
            for (const date of DAILY_DATES) {
                const isPresent = shouldAttend(profile);

                attendance.push({
                    studentId: osId,
                    courseId: course.id,
                    date,
                    status: isPresent ? 'PRESENT' : 'ABSENT'
                });

                if (isPresent) {
                    const d = val(scores.d);
                    dailyGrades.push({
                        studentId: osId,
                        courseId: course.id,
                        date,
                        memorization: profile === 'PERFECT' ? 5 : d * 0.5,
                        review: profile === 'PERFECT' ? 5 : d * 0.5
                    });

                    behaviorGrades.push({
                        studentId: osId,
                        courseId: course.id,
                        date,
                        dailyScore: 1.00
                    });

                    behaviorPoints.push({
                        studentId: osId,
                        courseId: course.id,
                        date,
                        earlyAttendance: profile === 'PERFECT' || Math.random() > 0.5,
                        perfectMemorization: profile === 'PERFECT' || d > 9,
                        activeParticipation: true,
                        timeCommitment: true
                    });
                }
            }

            // Weekly grades (10 weeks)
            for (let week = 1; week <= 10; week++) {
                weeklyGrades.push({
                    studentId: osId,
                    courseId: course.id,
                    week,
                    grade: val(scores.w)
                });
            }

            // Monthly grades (3 months)
            for (let month = 1; month <= 3; month++) {
                monthlyGrades.push({
                    studentId: osId,
                    courseId: course.id,
                    month,
                    quranForgetfulness: val(scores.mQ),
                    quranMajorMistakes: val(scores.mQ),
                    quranMinorMistakes: val(scores.mQ),
                    tajweedTheory: val(scores.mT)
                });
            }

            // Final exam
            finalExams.push({
                studentId: osId,
                courseId: course.id,
                quranTest: val(scores.fQ),
                tajweedTest: val(scores.fT)
            });

            studentNumber++;
        }
    }

    console.log(`  📝 المستخدمين: ${users.length}`);
    console.log(`  👧 الطالبات: ${students.length}`);
    console.log(`  📋 التسجيلات: ${enrollments.length}`);
    console.log(`  📅 الحضور: ${attendance.length}`);
    console.log(`  📊 الدرجات اليومية: ${dailyGrades.length}`);

    // ==================== PHASE 3: Batch Insert ====================
    console.log('\n💾 المرحلة 3: إدخال البيانات...');

    await batchInsert('user', users, 'المستخدمين');
    await batchInsert('student', students, 'الطالبات');
    await batchInsert('enrollment', enrollments, 'التسجيلات');
    await batchInsert('attendance', attendance, 'الحضور');
    await batchInsert('dailyGrade', dailyGrades, 'الدرجات اليومية');
    await batchInsert('behaviorGrade', behaviorGrades, 'درجات السلوك');
    await batchInsert('behaviorPoint', behaviorPoints, 'نقاط السلوك');
    await batchInsert('weeklyGrade', weeklyGrades, 'الدرجات الأسبوعية');
    await batchInsert('monthlyGrade', monthlyGrades, 'الدرجات الشهرية');
    await batchInsert('finalExam', finalExams, 'الاختبارات النهائية');

    // ==================== SUMMARY ====================
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalRecords = users.length + students.length + enrollments.length +
        attendance.length + dailyGrades.length + behaviorGrades.length +
        behaviorPoints.length + weeklyGrades.length + monthlyGrades.length + finalExams.length;

    console.log('\n' + '='.repeat(50));
    console.log('✅ تمت المحاكاة بنجاح!');
    console.log('='.repeat(50));
    console.log(`
📊 الإحصائيات:
   👩‍🏫 المعلمات: ${TEACHERS.length}
   📚 الحلقات: ${courseData.length}
   👧 الطالبات: ${students.length}
   
   📦 إجمالي السجلات: ${totalRecords.toLocaleString()}
   ⏱️ الوقت: ${duration}s
   🚀 السرعة: ${Math.round(totalRecords / duration)} سجل/ثانية
`);
    console.log('='.repeat(50));
    console.log('\n💡 للتجربة:');
    console.log('   📧 teacher1@shamokh.edu');
    console.log('   🔑 teacher123\n');
}

main()
    .catch((e) => { console.error('❌ خطأ:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
