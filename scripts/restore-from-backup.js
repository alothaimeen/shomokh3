/**
 * سكربت استعادة البيانات من النسخة الاحتياطية
 * ===========================================
 * يستعيد البيانات من ملف backup-*.json إلى قاعدة البيانات الجديدة
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function restore() {
  console.log('🔄 بدء استعادة البيانات...\n');
  
  // قراءة ملف النسخة الاحتياطية
  const backupFile = 'backup-2025-12-05T06-35-20.json';
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  console.log('📂 ملف النسخة الاحتياطية:', backupFile);
  console.log('📊 إجمالي السجلات:', backup.stats.totalRecords);
  console.log('');

  try {
    // 1. استعادة المستخدمين
    console.log('👥 استعادة المستخدمين...');
    let usersRestored = 0;
    for (const user of backup.data.users) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            userName: user.userName,
            userEmail: user.userEmail,
            passwordHash: user.passwordHash,
            userRole: user.userRole,
            isActive: user.isActive,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
        usersRestored++;
      } catch (e) {
        // تجاهل التكرارات
      }
    }
    console.log(`   ✅ ${usersRestored}/${backup.data.users.length} مستخدم`);

    // 2. استعادة البرامج
    console.log('📚 استعادة البرامج...');
    let programsRestored = 0;
    for (const prog of backup.data.programs) {
      try {
        await prisma.program.create({
          data: {
            id: prog.id,
            programName: prog.programName,
            programDescription: prog.programDescription,
            isActive: prog.isActive,
            createdAt: new Date(prog.createdAt),
            updatedAt: new Date(prog.updatedAt)
          }
        });
        programsRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${programsRestored}/${backup.data.programs.length} برنامج`);

    // 3. استعادة الحلقات
    console.log('🎓 استعادة الحلقات...');
    let coursesRestored = 0;
    for (const course of backup.data.courses) {
      try {
        await prisma.course.create({
          data: {
            id: course.id,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            programId: course.programId,
            teacherId: course.teacherId,
            maxStudents: course.maxStudents,
            isActive: course.isActive,
            createdAt: new Date(course.createdAt),
            updatedAt: new Date(course.updatedAt)
          }
        });
        coursesRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${coursesRestored}/${backup.data.courses.length} حلقة`);

    // 4. استعادة الطالبات
    console.log('👧 استعادة الطالبات...');
    let studentsRestored = 0;
    for (const student of backup.data.students) {
      try {
        await prisma.student.create({
          data: {
            id: student.id,
            userId: student.userId,
            studentName: student.studentName,
            studentPhone: student.studentPhone,
            studentGrade: student.studentGrade,
            parentPhone: student.parentPhone,
            enrollmentDate: new Date(student.enrollmentDate),
            createdAt: new Date(student.createdAt),
            updatedAt: new Date(student.updatedAt)
          }
        });
        studentsRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${studentsRestored}/${backup.data.students.length} طالبة`);

    // 5. استعادة التسجيلات
    console.log('📝 استعادة التسجيلات...');
    let enrollmentsRestored = 0;
    for (const enroll of backup.data.enrollments) {
      try {
        await prisma.enrollment.create({
          data: {
            id: enroll.id,
            studentId: enroll.studentId,
            courseId: enroll.courseId,
            enrollmentDate: new Date(enroll.enrollmentDate),
            isActive: enroll.isActive,
            createdAt: new Date(enroll.createdAt),
            updatedAt: new Date(enroll.updatedAt)
          }
        });
        enrollmentsRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${enrollmentsRestored}/${backup.data.enrollments.length} تسجيل`);

    // 6. استعادة الحضور (بدفعات)
    console.log('📅 استعادة الحضور...');
    let attendanceRestored = 0;
    const attendanceBatch = 100;
    for (let i = 0; i < backup.data.attendance.length; i += attendanceBatch) {
      const batch = backup.data.attendance.slice(i, i + attendanceBatch);
      for (const att of batch) {
        try {
          await prisma.attendance.create({
            data: {
              id: att.id,
              studentId: att.studentId,
              courseId: att.courseId,
              date: new Date(att.date),
              status: att.status,
              notes: att.notes,
              createdAt: new Date(att.createdAt),
              updatedAt: new Date(att.updatedAt)
            }
          });
          attendanceRestored++;
        } catch (e) {}
      }
      process.stdout.write(`\r   ⏳ ${attendanceRestored}/${backup.data.attendance.length}`);
    }
    console.log(`\n   ✅ ${attendanceRestored}/${backup.data.attendance.length} سجل حضور`);

    // 7. استعادة الدرجات اليومية
    console.log('📊 استعادة الدرجات اليومية...');
    let dailyGradesRestored = 0;
    for (let i = 0; i < backup.data.dailyGrades.length; i += 100) {
      const batch = backup.data.dailyGrades.slice(i, i + 100);
      for (const grade of batch) {
        try {
          await prisma.dailyGrade.create({
            data: {
              id: grade.id,
              studentId: grade.studentId,
              courseId: grade.courseId,
              date: new Date(grade.date),
              memorization: grade.memorization,
              review: grade.review,
              notes: grade.notes,
              createdAt: new Date(grade.createdAt),
              updatedAt: new Date(grade.updatedAt)
            }
          });
          dailyGradesRestored++;
        } catch (e) {}
      }
      process.stdout.write(`\r   ⏳ ${dailyGradesRestored}/${backup.data.dailyGrades.length}`);
    }
    console.log(`\n   ✅ ${dailyGradesRestored}/${backup.data.dailyGrades.length} درجة يومية`);

    // 8. استعادة الدرجات الأسبوعية
    console.log('📊 استعادة الدرجات الأسبوعية...');
    let weeklyGradesRestored = 0;
    for (const grade of backup.data.weeklyGrades) {
      try {
        await prisma.weeklyGrade.create({
          data: {
            id: grade.id,
            studentId: grade.studentId,
            courseId: grade.courseId,
            weekNumber: grade.weekNumber,
            grade: grade.grade,
            notes: grade.notes,
            createdAt: new Date(grade.createdAt),
            updatedAt: new Date(grade.updatedAt)
          }
        });
        weeklyGradesRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${weeklyGradesRestored}/${backup.data.weeklyGrades.length} درجة أسبوعية`);

    // 9. استعادة الدرجات الشهرية
    console.log('📊 استعادة الدرجات الشهرية...');
    let monthlyGradesRestored = 0;
    for (const grade of backup.data.monthlyGrades) {
      try {
        await prisma.monthlyGrade.create({
          data: {
            id: grade.id,
            studentId: grade.studentId,
            courseId: grade.courseId,
            monthNumber: grade.monthNumber,
            quranForgetfulness: grade.quranForgetfulness,
            quranMajor: grade.quranMajor,
            quranMinor: grade.quranMinor,
            tajweed: grade.tajweed,
            notes: grade.notes,
            createdAt: new Date(grade.createdAt),
            updatedAt: new Date(grade.updatedAt)
          }
        });
        monthlyGradesRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${monthlyGradesRestored}/${backup.data.monthlyGrades.length} درجة شهرية`);

    // 10. استعادة الاختبارات النهائية
    console.log('📊 استعادة الاختبارات النهائية...');
    let finalExamsRestored = 0;
    for (const exam of backup.data.finalExams) {
      try {
        await prisma.finalExam.create({
          data: {
            id: exam.id,
            studentId: exam.studentId,
            courseId: exam.courseId,
            grade: exam.grade,
            notes: exam.notes,
            createdAt: new Date(exam.createdAt),
            updatedAt: new Date(exam.updatedAt)
          }
        });
        finalExamsRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${finalExamsRestored}/${backup.data.finalExams.length} اختبار نهائي`);

    // 11. استعادة درجات السلوك
    console.log('📊 استعادة درجات السلوك...');
    let behaviorGradesRestored = 0;
    for (let i = 0; i < backup.data.behaviorGrades.length; i += 100) {
      const batch = backup.data.behaviorGrades.slice(i, i + 100);
      for (const grade of batch) {
        try {
          await prisma.behaviorGrade.create({
            data: {
              id: grade.id,
              studentId: grade.studentId,
              courseId: grade.courseId,
              date: new Date(grade.date),
              grade: grade.grade,
              notes: grade.notes,
              createdAt: new Date(grade.createdAt),
              updatedAt: new Date(grade.updatedAt)
            }
          });
          behaviorGradesRestored++;
        } catch (e) {}
      }
      process.stdout.write(`\r   ⏳ ${behaviorGradesRestored}/${backup.data.behaviorGrades.length}`);
    }
    console.log(`\n   ✅ ${behaviorGradesRestored}/${backup.data.behaviorGrades.length} درجة سلوك`);

    // 12. استعادة نقاط السلوك
    console.log('⭐ استعادة نقاط السلوك...');
    let behaviorPointsRestored = 0;
    for (let i = 0; i < backup.data.behaviorPoints.length; i += 100) {
      const batch = backup.data.behaviorPoints.slice(i, i + 100);
      for (const point of batch) {
        try {
          await prisma.behaviorPoint.create({
            data: {
              id: point.id,
              studentId: point.studentId,
              courseId: point.courseId,
              date: new Date(point.date),
              attendance: point.attendance,
              uniform: point.uniform,
              interaction: point.interaction,
              focus: point.focus,
              notes: point.notes,
              createdAt: new Date(point.createdAt),
              updatedAt: new Date(point.updatedAt)
            }
          });
          behaviorPointsRestored++;
        } catch (e) {}
      }
      process.stdout.write(`\r   ⏳ ${behaviorPointsRestored}/${backup.data.behaviorPoints.length}`);
    }
    console.log(`\n   ✅ ${behaviorPointsRestored}/${backup.data.behaviorPoints.length} نقطة سلوك`);

    // 13. استعادة إعدادات الموقع
    console.log('⚙️ استعادة إعدادات الموقع...');
    let settingsRestored = 0;
    for (const setting of backup.data.publicSiteSettings) {
      try {
        await prisma.publicSiteSettings.create({
          data: {
            id: setting.id,
            studentsCount: setting.studentsCount,
            teachersCount: setting.teachersCount,
            coursesCount: setting.coursesCount,
            facesCompleted: setting.facesCompleted,
            aboutVision: setting.aboutVision,
            aboutMission: setting.aboutMission,
            aboutGoals: setting.aboutGoals,
            achievementsText: setting.achievementsText,
            contactEmail: setting.contactEmail,
            contactPhone: setting.contactPhone,
            contactAddress: setting.contactAddress,
            contactWhatsapp: setting.contactWhatsapp,
            contactIban: setting.contactIban,
            createdAt: new Date(setting.createdAt),
            updatedAt: new Date(setting.updatedAt)
          }
        });
        settingsRestored++;
      } catch (e) {}
    }
    console.log(`   ✅ ${settingsRestored}/${backup.data.publicSiteSettings.length} إعداد`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ تمت الاستعادة بنجاح!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
