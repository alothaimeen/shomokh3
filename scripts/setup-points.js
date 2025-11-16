const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupPoints() {
  try {
    console.log('إنشاء نقاط عشوائية للطالبات...');

    // جلب جميع التسجيلات النشطة
    const enrollments = await prisma.enrollment.findMany({
      where: { isActive: true },
      include: {
        student: true,
        course: true
      }
    });

    console.log(`وجدنا ${enrollments.length} تسجيل نشط`);

    // الاحتفاظ بالبيانات الحقيقية للطالبة المحددة
    const keepStudent = await prisma.student.findFirst({
      where: { studentName: { contains: 'فاطمة' } }
    });

    if (keepStudent) {
      console.log(`✅ الاحتفاظ بنقاط الطالبة: ${keepStudent.studentName}`);
    }

    let tasksCreated = 0;
    let pointsCreated = 0;

    for (const enrollment of enrollments) {
      // تخطي الطالبة الحقيقية
      if (keepStudent && enrollment.studentId === keepStudent.id) {
        console.log(`تخطي الطالبة: ${enrollment.student.studentName}`);
        continue;
      }

      // إنشاء 70 يوم من المهام اليومية (تاريخ عشوائي خلال الأشهر الثلاثة الماضية)
      for (let day = 0; day < 70; day++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // آخر 90 يوم

        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO daily_tasks (id, date, listening_count, repetition_count, recited_to_peer, student_id, course_id, created_at, updated_at)
            VALUES (
              '${Math.random().toString(36).substring(7)}',
              '${date.toISOString()}',
              ${Math.floor(Math.random() * 6)},
              ${Math.floor(Math.random() * 11)},
              ${Math.random() > 0.5},
              '${enrollment.studentId}',
              '${enrollment.courseId}',
              NOW(),
              NOW()
            )
            ON CONFLICT (student_id, course_id, date) DO NOTHING
          `);
          tasksCreated++;
        } catch (err) {
          // تخطي إذا كان التاريخ موجود
        }
      }

      // إنشاء 70 يوم من النقاط السلوكية
      for (let day = 0; day < 70; day++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));

        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO behavior_points (id, date, early_attendance, perfect_memorization, active_participation, time_commitment, student_id, course_id, created_at, updated_at)
            VALUES (
              '${Math.random().toString(36).substring(7)}',
              '${date.toISOString()}',
              ${Math.random() > 0.3},
              ${Math.random() > 0.4},
              ${Math.random() > 0.3},
              ${Math.random() > 0.2},
              '${enrollment.studentId}',
              '${enrollment.courseId}',
              NOW(),
              NOW()
            )
            ON CONFLICT (student_id, course_id, date) DO NOTHING
          `);
          pointsCreated++;
        } catch (err) {
          // تخطي إذا كان التاريخ موجود
        }
      }

      console.log(`✅ ${enrollment.student.studentName}: ${tasksCreated} مهام، ${pointsCreated} نقاط`);
    }

    console.log('\n✅ تم إنشاء النقاط العشوائية بنجاح');
    console.log(`المجموع: ${tasksCreated} مهام يومية، ${pointsCreated} نقاط سلوكية`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPoints();
