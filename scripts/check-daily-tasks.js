const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTasks() {
  try {
    console.log('🔍 فحص المهام اليومية...\n');

    // جلب جميع المهام
    const tasks = await prisma.dailyTask.findMany({
      include: {
        student: {
          select: {
            studentName: true,
            studentNumber: true,
          }
        },
        course: {
          select: {
            courseName: true,
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`📊 إجمالي المهام: ${tasks.length}\n`);

    if (tasks.length === 0) {
      console.log('⚠️  لا توجد مهام في قاعدة البيانات');
    } else {
      tasks.forEach(task => {
        const dateStr = new Date(task.date).toLocaleDateString('ar-SA');
        console.log(`- التاريخ: ${dateStr} (${task.date.toISOString()})`);
        console.log(`  الطالبة: ${task.student.studentName} (م${task.student.studentNumber})`);
        console.log(`  الحلقة: ${task.course.courseName}`);
        console.log(`  نوع المهمة: ${task.taskType}`);
        console.log(`  الآيات: من ${task.fromAyah} إلى ${task.toAyah} - ${task.surah}`);
        console.log(`  الدرجة: ${task.grade || 'لم تُقيّم'}`);
        console.log(`  الملاحظات: ${task.notes || 'لا توجد'}\n`);
      });
    }

    // فحص مهام يوم 17/11/2025
    console.log('\n📋 مهام يوم 17/11/2025:\n');
    const todayTasks = await prisma.dailyTask.findMany({
      where: {
        date: {
          gte: new Date('2025-11-17T00:00:00.000Z'),
          lt: new Date('2025-11-18T00:00:00.000Z')
        }
      },
      include: {
        student: {
          select: {
            studentName: true,
            studentNumber: true,
          }
        },
        course: {
          select: {
            courseName: true,
          }
        }
      }
    });

    if (todayTasks.length === 0) {
      console.log('⚠️  لا توجد مهام في 17/11/2025');
    } else {
      todayTasks.forEach(task => {
        console.log(`- ${task.student.studentName}: ${task.taskType} - ${task.surah} (${task.fromAyah}-${task.toAyah})`);
        console.log(`  التاريخ الدقيق: ${task.date.toISOString()}`);
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTasks();
