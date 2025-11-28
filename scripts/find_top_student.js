const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Searching for the top student...");

    const students = await prisma.student.findMany({
        include: {
            attendance: true,
            dailyGrades: true,
            weeklyGrades: true,
            monthlyGrades: true,
            finalExams: true
        }
    });

    let topStudent = null;
    let maxScore = -1;

    for (const student of students) {
        let totalScore = 0;
        let possibleScore = 0;
        let absences = 0;

        // Check Attendance
        absences = student.attendance.filter(a => a.status === 'ABSENT').length;

        // Daily Grades (Max 10)
        for (const g of student.dailyGrades) {
            totalScore += (g.memorization + g.review);
            possibleScore += 10;
        }

        // Weekly Grades (Max 5)
        for (const g of student.weeklyGrades) {
            totalScore += g.grade;
            possibleScore += 5;
        }

        // Monthly Grades (Max 30)
        for (const g of student.monthlyGrades) {
            totalScore += (g.quranForgetfulness + g.quranMajorMistakes + g.quranMinorMistakes + g.tajweedTheory);
            possibleScore += 30;
        }

        // Final Exam (Max 100)
        // Note: Seeding script split it into quranTest (66%) and tajweedTest (34%) of the total score (60 points max in seeding logic?)
        // Let's check seeding logic: Final was 60 points max.
        for (const g of student.finalExams) {
            totalScore += (g.quranTest + g.tajweedTest);
            possibleScore += 60;
        }

        const percentage = possibleScore > 0 ? (totalScore / possibleScore) * 100 : 0;

        // We prioritize 0 absences, then highest score
        if (absences === 0) {
            if (percentage > maxScore) {
                maxScore = percentage;
                topStudent = { ...student, totalScore, possibleScore, percentage, absences };
            }
        }
    }

    if (topStudent) {
        console.log(`\n🏆 Top Student (0 Absences):`);
        console.log(`Name: ${topStudent.studentName}`);
        console.log(`Number: ${topStudent.studentNumber}`);
        console.log(`Absences: ${topStudent.absences}`);
        console.log(`Total Score: ${topStudent.totalScore.toFixed(2)} / ${topStudent.possibleScore}`);
        console.log(`Percentage: ${topStudent.percentage.toFixed(4)}%`);
    } else {
        console.log("\n❌ No student found with 0 absences.");
        // Fallback: Best student regardless of absence
        // ... (could add fallback logic here if needed)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
