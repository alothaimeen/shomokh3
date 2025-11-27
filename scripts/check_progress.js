const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.count();
    const attendance = await prisma.attendance.count();
    const dailyGrades = await prisma.dailyGrade.count();
    const weeklyGrades = await prisma.weeklyGrade.count();
    const monthlyGrades = await prisma.monthlyGrade.count();
    const finalExams = await prisma.finalExam.count();

    console.log(`Students: ${students}`);
    console.log(`Attendance: ${attendance}`);
    console.log(`Daily Grades: ${dailyGrades}`);
    console.log(`Weekly Grades: ${weeklyGrades}`);
    console.log(`Monthly Grades: ${monthlyGrades}`);
    console.log(`Final Exams: ${finalExams}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
