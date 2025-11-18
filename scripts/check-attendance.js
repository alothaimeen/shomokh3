const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAttendance() {
  try {
    console.log('🔍 فحص سجلات الحضور...\n');

    const attendance = await prisma.attendance.findMany({
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

    console.log(`📊 إجمالي سجلات الحضور: ${attendance.length}\n`);

    attendance.forEach(record => {
      console.log(`- التاريخ: ${new Date(record.date).toLocaleDateString('ar-SA')}`);
      console.log(`  الطالبة: ${record.student.studentName} (م${record.student.studentNumber})`);
      console.log(`  الحلقة: ${record.course.courseName}`);
      console.log(`  الحالة: ${record.status}`);
      console.log(`  الملاحظات: ${record.notes || 'لا توجد'}\n`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttendance();
