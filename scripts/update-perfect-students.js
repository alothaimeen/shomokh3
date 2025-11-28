const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Student numbers with PERFECT profile (one per circle)
const PERFECT_STUDENTS = [1000, 1030, 1060, 1090, 1120, 1150, 1180, 1210, 1240];

async function updatePerfectStudents() {
    console.log('🔧 Updating PERFECT profile students to 100% grades...\n');

    for (const studentNumber of PERFECT_STUDENTS) {
        const student = await prisma.student.findFirst({
            where: { studentNumber }
        });

        if (!student) {
            console.log(`❌ Student ${studentNumber} not found`);
            continue;
        }

        console.log(`📝 Updating ${student.studentName} (${studentNumber})...`);

        // Update daily grades to perfect (5 + 5 = 10)
        await prisma.dailyGrade.updateMany({
            where: { studentId: student.id },
            data: { memorization: 5, review: 5 }
        });

        // Update weekly grades to perfect (5)
        await prisma.weeklyGrade.updateMany({
            where: { studentId: student.id },
            data: { grade: 5 }
        });

        // Update monthly grades to perfect (5 + 5 + 5 + 15 = 30)
        await prisma.monthlyGrade.updateMany({
            where: { studentId: student.id },
            data: { 
                quranForgetfulness: 5,
                quranMajorMistakes: 5,
                quranMinorMistakes: 5,
                tajweedTheory: 15
            }
        });

        // Update final exam to perfect (40 + 20 = 60)
        await prisma.finalExam.updateMany({
            where: { studentId: student.id },
            data: { quranTest: 40, tajweedTest: 20 }
        });

        // Update behavior points to all true
        await prisma.behaviorPoint.updateMany({
            where: { studentId: student.id },
            data: {
                earlyAttendance: true,
                perfectMemorization: true,
                activeParticipation: true,
                timeCommitment: true
            }
        });

        // Update attendance to all PRESENT
        await prisma.attendance.updateMany({
            where: { studentId: student.id },
            data: { status: 'PRESENT' }
        });

        console.log(`   ✅ Done!`);
    }

    console.log('\n✅ All PERFECT students updated!');
    await prisma.$disconnect();
}

updatePerfectStudents().catch(console.error);
