const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPerfectStudent() {
    console.log('🔍 Checking PERFECT profile student (studentNumber: 1000)...\n');

    // Find student
    const student = await prisma.student.findFirst({
        where: { studentNumber: 1000 }
    });

    if (!student) {
        console.log('❌ Student 1000 not found!');
        await prisma.$disconnect();
        return;
    }

    console.log('✅ Student:', student.studentName, '(ID:', student.id, ')\n');

    // Check daily grades
    const dailyGrades = await prisma.dailyGrade.findMany({
        where: { studentId: student.id },
        take: 10
    });
    console.log('📊 Daily Grades (first 10):');
    dailyGrades.forEach(g => {
        const mem = Number(g.memorization);
        const rev = Number(g.review);
        const total = mem + rev;
        console.log(`   ${g.date.toISOString().split('T')[0]}: memorization=${mem}, review=${rev}, total=${total}`);
    });
    const perfectDaily = dailyGrades.filter(g => Number(g.memorization) === 5 && Number(g.review) === 5);
    console.log(`   ✅ Perfect daily grades: ${perfectDaily.length}/${dailyGrades.length}\n`);

    // Check weekly grades
    const weeklyGrades = await prisma.weeklyGrade.findMany({
        where: { studentId: student.id }
    });
    console.log('📊 Weekly Grades:');
    weeklyGrades.forEach(g => {
        console.log(`   Week ${g.week}: grade=${Number(g.grade)}`);
    });
    const perfectWeekly = weeklyGrades.filter(g => Number(g.grade) === 5);
    console.log(`   ✅ Perfect weekly grades: ${perfectWeekly.length}/${weeklyGrades.length}\n`);

    // Check monthly grades
    const monthlyGrades = await prisma.monthlyGrade.findMany({
        where: { studentId: student.id }
    });
    console.log('📊 Monthly Grades:');
    monthlyGrades.forEach(g => {
        const f = Number(g.quranForgetfulness);
        const maj = Number(g.quranMajorMistakes);
        const min = Number(g.quranMinorMistakes);
        const taj = Number(g.tajweedTheory);
        const total = f + maj + min + taj;
        console.log(`   Month ${g.month}: f=${f}, maj=${maj}, min=${min}, taj=${taj}, total=${total}`);
    });
    const perfectMonthly = monthlyGrades.filter(g => 
        Number(g.quranForgetfulness) === 5 && 
        Number(g.quranMajorMistakes) === 5 &&
        Number(g.quranMinorMistakes) === 5 &&
        Number(g.tajweedTheory) === 15
    );
    console.log(`   ✅ Perfect monthly grades: ${perfectMonthly.length}/${monthlyGrades.length}\n`);

    // Check final exam
    const finalExam = await prisma.finalExam.findFirst({
        where: { studentId: student.id }
    });
    console.log('📊 Final Exam:');
    if (finalExam) {
        const q = Number(finalExam.quranTest);
        const t = Number(finalExam.tajweedTest);
        console.log(`   quranTest=${q}/40, tajweedTest=${t}/20`);
        console.log(`   ✅ Perfect final: ${q === 40 && t === 20 ? 'YES' : 'NO'}\n`);
    }

    // Check behavior points
    const behaviorPoints = await prisma.behaviorPoint.findMany({
        where: { studentId: student.id },
        take: 10
    });
    console.log('📊 Behavior Points (first 10):');
    behaviorPoints.forEach(bp => {
        const allTrue = bp.earlyAttendance && bp.perfectMemorization && bp.activeParticipation && bp.timeCommitment;
        console.log(`   ${bp.date.toISOString().split('T')[0]}: all-true=${allTrue}`);
    });
    const perfectBehavior = behaviorPoints.filter(bp => 
        bp.earlyAttendance && bp.perfectMemorization && bp.activeParticipation && bp.timeCommitment
    );
    console.log(`   ✅ Perfect behavior: ${perfectBehavior.length}/${behaviorPoints.length}\n`);

    // Check attendance
    const attendance = await prisma.attendance.findMany({
        where: { studentId: student.id }
    });
    const present = attendance.filter(a => a.status === 'PRESENT');
    console.log(`📊 Attendance: ${present.length}/${attendance.length} present (${(present.length/attendance.length*100).toFixed(1)}%)\n`);

    await prisma.$disconnect();
}

verifyPerfectStudent().catch(console.error);
