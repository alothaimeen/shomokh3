const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Configure connection pool timeout (30s instead of default 10s)
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_data.json'), 'utf8'));

// Retry helper for transient connection errors
async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries || !error.code?.startsWith('P20')) {
                throw error;
            }
            console.log(`  ⚠️ Retry ${attempt}/${maxRetries} after ${delayMs}ms...`);
            await new Promise(r => setTimeout(r, delayMs));
            delayMs *= 2; // Exponential backoff
        }
    }
}

// Sequential processing to avoid pool exhaustion
async function processSequentially(items, processFn, label = '') {
    for (let i = 0; i < items.length; i++) {
        await withRetry(() => processFn(items[i]));
        if ((i + 1) % 50 === 0) {
            console.log(`  ${label}: ${i + 1}/${items.length}`);
        }
    }
}

// Calendar Constants
const START_DATE = new Date('2025-08-31');
const END_DATE = new Date('2025-12-18');
const HOLIDAYS = [
    '2025-09-23', // National Day
    '2025-10-12', // Extra Holiday
    '2025-11-23', '2025-11-24', '2025-11-25', '2025-11-26', '2025-11-27', // Autumn Break
    '2025-12-11', '2025-12-14' // Extra Holidays
];

// Week values must be 1-10 per schema constraint
const WEEKLY_EXAM_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// Month values must be 1-3 per schema constraint  
const MONTHLY_EXAM_WEEKS = [1, 2, 3];
const FINAL_EXAM_WEEK = 16;

function isHoliday(date) {
    const dateString = date.toISOString().split('T')[0];
    return HOLIDAYS.includes(dateString);
}

function getWeekNumber(date) {
    const diff = date.getTime() - START_DATE.getTime();
    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function getRandomScore(min, max, decimals = 2) {
    const score = Math.random() * (max - min) + min;
    return parseFloat(score.toFixed(decimals));
}

function shouldAttend(profile) {
    const rates = {
        'PERFECT': 1.0,    // 100% حضور
        'EXCELLENT': 0.98,
        'GOOD': 0.90,
        'WEAK': 0.80,
        'FAILING': 0.70
    };
    return Math.random() < rates[profile];
}

async function main() {
    console.log("🚀 Starting OPTIMIZED simulation seeding...");
    const startTime = Date.now();

    // 1. Programs, Circles, Teachers (Sequential is fine, low volume)
    const programMap = new Map(); // name -> id
    const circleMap = new Map(); // name -> {id, teacherId}
    const teacherMap = new Map(); // email -> id

    console.log("📦 preparing structure...");

    for (const programData of data) {
        // Program
        let program = await prisma.program.findFirst({ where: { programName: programData.name } });
        if (!program) {
            program = await prisma.program.create({
                data: { programName: programData.name, programDescription: programData.description }
            });
        }
        programMap.set(programData.name, program.id);

        for (const circleData of programData.circles) {
            // Teacher
            const teacherPassword = await bcrypt.hash(circleData.teacher.password, 10);
            const teacher = await prisma.user.upsert({
                where: { userEmail: circleData.teacher.email },
                update: {},
                create: {
                    userName: circleData.teacher.name,
                    userEmail: circleData.teacher.email,
                    passwordHash: teacherPassword,
                    userRole: 'TEACHER'
                }
            });
            teacherMap.set(circleData.teacher.email, teacher.id);

            // Circle
            let course = await prisma.course.findFirst({
                where: { courseName: circleData.name, programId: program.id }
            });
            if (!course) {
                course = await prisma.course.create({
                    data: {
                        courseName: circleData.name,
                        programId: program.id,
                        teacherId: teacher.id,
                        maxStudents: 30
                    }
                });
            }
            circleMap.set(circleData.name, { id: course.id, teacherId: teacher.id });
        }
    }

    // 2. Prepare Students (Batch)
    console.log("👥 Preparing students...");
    const studentsToCreate = [];
    const studentUsersToCreate = [];
    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    // Flatten data for easy processing
    const allStudents = [];
    for (const programData of data) {
        for (const circleData of programData.circles) {
            const circleInfo = circleMap.get(circleData.name);
            for (const studentData of circleData.students) {
                allStudents.push({
                    ...studentData,
                    circleId: circleInfo.id
                });
            }
        }
    }

    // Create Users first (Upsert one by one is safest for Users due to unique email, 
    // but for speed we can try createMany with skipDuplicates if we assume clean slate or handle errors.
    // Given we want to update if exists, upsert is better. 
    // To speed up, we can use Promise.all in chunks.)

    console.log(`Processing ${allStudents.length} students...`);

    // Chunking helper
    const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );

    // Create Users SEQUENTIALLY to avoid pool exhaustion
    console.log("  Creating user accounts...");
    await processSequentially(allStudents, (s) =>
        prisma.user.upsert({
            where: { userEmail: s.email },
            update: {},
            create: {
                userName: s.name,
                userEmail: s.email,
                passwordHash: defaultPasswordHash,
                userRole: 'STUDENT'
            }
        }),
        'Users'
    );

    // Fetch all users to get IDs
    const users = await prisma.user.findMany({
        where: { userRole: 'STUDENT' },
        select: { id: true, userEmail: true }
    });
    const userEmailToId = new Map(users.map(u => [u.userEmail, u.id]));

    // Create Students SEQUENTIALLY to avoid pool exhaustion
    console.log("  Creating student records...");
    await processSequentially(allStudents, (s) =>
        prisma.student.upsert({
            where: { studentNumber: s.studentNumber },
            update: {},
            create: {
                studentName: s.name,
                studentNumber: s.studentNumber,
                userId: userEmailToId.get(s.email),
                qualification: "General",
                nationality: "Saudi",
                studentPhone: "0500000000",
                memorizedAmount: "None",
                paymentStatus: "PAID"
            }
        }),
        'Students'
    );

    // Fetch all students to get IDs
    const dbStudents = await prisma.student.findMany({
        select: { id: true, studentNumber: true }
    });
    const studentNumToId = new Map(dbStudents.map(s => [s.studentNumber, s.id]));

    // 3. Enrollments (Batch)
    console.log("📝 Processing enrollments...");
    const enrollments = [];
    for (const s of allStudents) {
        enrollments.push({
            studentId: studentNumToId.get(s.studentNumber),
            courseId: s.circleId,
            enrolledAt: START_DATE
        });
    }
    // Use createMany with skipDuplicates
    await prisma.enrollment.createMany({
        data: enrollments,
        skipDuplicates: true
    });

    // 4. Simulation Data (Batch)
    console.log("📅 Simulating semester days...");
    const attendanceRecords = [];
    const dailyGrades = [];
    const behaviorPoints = [];
    const weeklyGrades = [];
    const monthlyGrades = [];
    const finalExams = [];

    for (const s of allStudents) {
        const sId = studentNumToId.get(s.studentNumber);
        const cId = s.circleId;

        let currentDate = new Date(START_DATE);
        while (currentDate <= END_DATE) {
            if (currentDate.getDay() !== 5 && currentDate.getDay() !== 6 && !isHoliday(currentDate)) {
                const isPresent = shouldAttend(s.profile);
                const dateIso = new Date(currentDate); // Clone

                // Attendance
                attendanceRecords.push({
                    studentId: sId,
                    courseId: cId,
                    date: dateIso,
                    status: isPresent ? 'PRESENT' : 'ABSENT'
                });

                if (isPresent) {
                    let dailyScore = 0;
                    if (s.profile === 'PERFECT') dailyScore = 10; // درجة كاملة
                    else if (s.profile === 'EXCELLENT') dailyScore = getRandomScore(9.5, 10);
                    else if (s.profile === 'GOOD') dailyScore = getRandomScore(8, 9.5);
                    else if (s.profile === 'WEAK') dailyScore = getRandomScore(6, 8);
                    else dailyScore = getRandomScore(0, 6);

                    // Daily Grade (memorization + review = 10 max)
                    dailyGrades.push({
                        studentId: sId,
                        courseId: cId,
                        date: dateIso,
                        memorization: s.profile === 'PERFECT' ? 5 : dailyScore * 0.5,
                        review: s.profile === 'PERFECT' ? 5 : dailyScore * 0.5
                    });

                    // Behavior (4 criteria × true = 20 points max)
                    behaviorPoints.push({
                        studentId: sId,
                        courseId: cId,
                        date: dateIso,
                        earlyAttendance: s.profile === 'PERFECT' ? true : Math.random() > 0.5,
                        perfectMemorization: s.profile === 'PERFECT' ? true : dailyScore > 9,
                        activeParticipation: true,
                        timeCommitment: true
                    });
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Weekly (max 5 per week)
        for (const week of WEEKLY_EXAM_WEEKS) {
            let score = 0;
            if (s.profile === 'PERFECT') score = 5; // درجة كاملة
            else if (s.profile === 'EXCELLENT') score = getRandomScore(4.5, 5);
            else if (s.profile === 'GOOD') score = getRandomScore(4, 4.5);
            else if (s.profile === 'WEAK') score = getRandomScore(3, 4);
            else score = getRandomScore(0, 3);

            weeklyGrades.push({
                studentId: sId,
                courseId: cId,
                week: week,
                grade: score
            });
        }

        // Monthly - scores must fit schema constraints:
        // quranForgetfulness, quranMajorMistakes, quranMinorMistakes: max 5.00
        // tajweedTheory: max 15.00
        for (const month of MONTHLY_EXAM_WEEKS) {
            let quranForget, quranMajor, quranMinor, tajweed;
            if (s.profile === 'PERFECT') {
                quranForget = 5;  // درجة كاملة
                quranMajor = 5;
                quranMinor = 5;
                tajweed = 15;
            } else if (s.profile === 'EXCELLENT') {
                quranForget = getRandomScore(4.5, 5);
                quranMajor = getRandomScore(4.5, 5);
                quranMinor = getRandomScore(4.5, 5);
                tajweed = getRandomScore(13.5, 15);
            } else if (s.profile === 'GOOD') {
                quranForget = getRandomScore(4, 4.5);
                quranMajor = getRandomScore(4, 4.5);
                quranMinor = getRandomScore(4, 4.5);
                tajweed = getRandomScore(12, 13.5);
            } else if (s.profile === 'WEAK') {
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
                studentId: sId,
                courseId: cId,
                month: month,
                quranForgetfulness: quranForget,
                quranMajorMistakes: quranMajor,
                quranMinorMistakes: quranMinor,
                tajweedTheory: tajweed
            });
        }

        // Final - quranTest max 40, tajweedTest max 20
        let quranTest, tajweedTest;
        if (s.profile === 'PERFECT') {
            quranTest = 40;  // درجة كاملة
            tajweedTest = 20;
        } else if (s.profile === 'EXCELLENT') {
            quranTest = getRandomScore(36, 40);
            tajweedTest = getRandomScore(18, 20);
        } else if (s.profile === 'GOOD') {
            quranTest = getRandomScore(32, 36);
            tajweedTest = getRandomScore(16, 18);
        } else if (s.profile === 'WEAK') {
            quranTest = getRandomScore(24, 32);
            tajweedTest = getRandomScore(12, 16);
        } else {
            quranTest = getRandomScore(0, 24);
            tajweedTest = getRandomScore(0, 12);
        }

        finalExams.push({
            studentId: sId,
            courseId: cId,
            quranTest: quranTest,
            tajweedTest: tajweedTest
        });
    }

    // Batch Insert Helper
    async function batchInsert(modelName, records) {
        console.log(`Inserting ${records.length} ${modelName} records...`);
        const chunks = chunk(records, 1000); // 1000 per batch
        for (const [i, batch] of chunks.entries()) {
            await prisma[modelName].createMany({
                data: batch,
                skipDuplicates: true
            });
            if (i % 5 === 0) console.log(`  ${modelName}: Processed ${(i + 1) * 1000} records...`);
        }
    }

    await batchInsert('attendance', attendanceRecords);
    await batchInsert('dailyGrade', dailyGrades);
    await batchInsert('behaviorPoint', behaviorPoints);
    await batchInsert('weeklyGrade', weeklyGrades);
    await batchInsert('monthlyGrade', monthlyGrades);
    await batchInsert('finalExam', finalExams);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`✅ Simulation seeding completed in ${duration.toFixed(2)}s!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
