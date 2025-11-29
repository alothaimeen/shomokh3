const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPerfectStudents() {
    // الطالبات المثاليات (رقم 1000, 1030, 1060, ...)
    const perfectStudentNumbers = [1000, 1030, 1060, 1090, 1120, 1150, 1180, 1210, 1240];
    
    console.log('📊 تقرير الطالبات المثاليات:');
    console.log('='.repeat(60));
    
    for (const num of perfectStudentNumbers.slice(0, 3)) {
        const student = await prisma.student.findFirst({
            where: { studentNumber: num },
            include: {
                dailyGrades: true,
                behaviorGrades: true,
                weeklyGrades: true,
                monthlyGrades: true,
                finalExams: true
            }
        });
        
        if (!student) continue;
        
        const dailyRaw = student.dailyGrades.reduce((sum, g) => 
            sum + Number(g.memorization) + Number(g.review), 0);
        const behaviorRaw = student.behaviorGrades.reduce((sum, g) => 
            sum + Number(g.dailyScore), 0);
        const weeklyRaw = student.weeklyGrades.reduce((sum, g) => 
            sum + Number(g.grade), 0);
        const monthlyRaw = student.monthlyGrades.reduce((sum, g) => 
            sum + Number(g.quranForgetfulness) + Number(g.quranMajorMistakes) + 
            Number(g.quranMinorMistakes) + Number(g.tajweedTheory), 0);
        const finalRaw = student.finalExams.length > 0 ? 
            Number(student.finalExams[0].quranTest) + Number(student.finalExams[0].tajweedTest) : 0;
        
        const daily = dailyRaw / 14;
        const behavior = behaviorRaw / 7;
        const monthly = monthlyRaw / 3;
        const total = daily + weeklyRaw + monthly + behavior + finalRaw;
        
        console.log(`\n${student.studentName} (رقم: ${num}):`);
        console.log(`  📅 عدد أيام الدرجات اليومية: ${student.dailyGrades.length}`);
        console.log(`  📅 عدد أيام السلوك: ${student.behaviorGrades.length}`);
        console.log(`  📝 اليومية (50): ${daily.toFixed(2)} (خام: ${dailyRaw})`);
        console.log(`  📝 الأسبوعية (50): ${weeklyRaw.toFixed(2)}`);
        console.log(`  📝 الشهرية (30): ${monthly.toFixed(2)} (خام: ${monthlyRaw})`);
        console.log(`  📝 السلوك (10): ${behavior.toFixed(2)} (خام: ${behaviorRaw})`);
        console.log(`  📝 النهائي (60): ${finalRaw.toFixed(2)}`);
        console.log(`  ✅ الإجمالي (200): ${total.toFixed(2)} = ${(total/2).toFixed(1)}%`);
    }
}

checkPerfectStudents()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
