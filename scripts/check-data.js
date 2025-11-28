const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('=== Programs & Courses ===');
    const programs = await prisma.program.findMany({
        include: {
            courses: {
                include: {
                    _count: { select: { enrollments: true } }
                }
            }
        }
    });
    console.log(JSON.stringify(programs, null, 2));

    console.log('\n=== Sample Student Grades ===');
    const student = await prisma.student.findFirst({
        include: {
            dailyGrades: { take: 2 },
            weeklyGrades: { take: 2 },
            monthlyGrades: { take: 1 },
            behaviorPoints: { take: 2 },
            finalExams: true
        }
    });
    console.log(JSON.stringify(student, null, 2));

    console.log('\n=== Counts ===');
    const counts = {
        programs: await prisma.program.count(),
        courses: await prisma.course.count(),
        students: await prisma.student.count(),
        enrollments: await prisma.enrollment.count(),
        dailyGrades: await prisma.dailyGrade.count(),
        weeklyGrades: await prisma.weeklyGrade.count(),
        monthlyGrades: await prisma.monthlyGrade.count(),
        behaviorPoints: await prisma.behaviorPoint.count(),
        finalExams: await prisma.finalExam.count()
    };
    console.log(counts);
}

main().finally(() => prisma.$disconnect());
