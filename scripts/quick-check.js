const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const seedStudents = await p.student.count({ where: { studentNumber: { gte: 1000, lte: 1269 } } });
    console.log('Students 1000-1269:', seedStudents);
    
    const total = await p.student.count();
    console.log('Total students:', total);
    
    // Check if data was re-seeded properly by looking at daily grades dates
    const latestDaily = await p.dailyGrade.findFirst({
        where: { student: { studentNumber: 1000 } },
        orderBy: { createdAt: 'desc' }
    });
    console.log('Latest daily grade created:', latestDaily?.createdAt);
    
    await p.$disconnect();
}

main();
