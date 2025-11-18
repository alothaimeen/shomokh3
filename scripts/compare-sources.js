const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function compareSources() {
  try {
    console.log('🔍 مقارنة مصادر البيانات...\n');

    // جلب حضور يوم 14/11/2025 (2025-11-14)
    const targetDate = new Date('2025-11-14');
    console.log('التاريخ المستهدف:', targetDate.toISOString());

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date('2025-11-14T00:00:00.000Z'),
          lt: new Date('2025-11-15T00:00:00.000Z')
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

    console.log(`\n📊 سجلات الحضور في 14/11/2025: ${attendance.length}\n`);

    if (attendance.length === 0) {
      console.log('⚠️  لا توجد سجلات حضور في هذا التاريخ');
    } else {
      attendance.forEach(record => {
        console.log(`- الطالبة: ${record.student.studentName} (م${record.student.studentNumber})`);
        console.log(`  الحلقة: ${record.course.courseName}`);
        console.log(`  الحالة: ${record.status}`);
        console.log(`  التاريخ الدقيق: ${record.date.toISOString()}`);
        console.log(`  الملاحظات: ${record.notes || 'لا توجد'}\n`);
      });
    }

    // فحص جميع سجلات الطالبة الأولى
    console.log('\n📋 جميع سجلات الطالبة الأولى:\n');
    const allRecords = await prisma.attendance.findMany({
      where: {
        student: {
          studentNumber: 1
        }
      },
      include: {
        course: {
          select: {
            courseName: true,
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    allRecords.forEach(record => {
      const dateStr = new Date(record.date).toLocaleDateString('ar-SA');
      console.log(`${dateStr}: ${record.status} - ${record.course.courseName}`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareSources();
