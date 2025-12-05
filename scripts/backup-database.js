/**
 * Supabase Database Full Backup Script
 * =====================================
 * Emergency backup script to export all data from the database.
 * 
 * Usage: node scripts/backup-database.js
 * Output: backup-YYYY-MM-DD_HH-MM-SS.json in the project root
 * 
 * Models backed up (15 total):
 * - User, Program, Course, Student
 * - EnrollmentRequest, Enrollment
 * - Attendance, DailyGrade, WeeklyGrade, MonthlyGrade
 * - FinalExam, BehaviorGrade, DailyTask, BehaviorPoint
 * - PublicSiteSettings
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  console.log('🚀 Starting database backup...\n');
  
  const backup = {
    metadata: {
      createdAt: new Date().toISOString(),
      projectId: 'nupiaprnfcedpvoybwpt',
      reason: 'Emergency backup - security incident',
      prismaVersion: require('@prisma/client/package.json').version
    },
    data: {},
    stats: {}
  };

  try {
    // 1. Users
    console.log('📦 Backing up Users...');
    backup.data.users = await prisma.user.findMany();
    backup.stats.users = backup.data.users.length;
    console.log(`   ✅ ${backup.stats.users} users`);

    // 2. Programs
    console.log('📦 Backing up Programs...');
    backup.data.programs = await prisma.program.findMany();
    backup.stats.programs = backup.data.programs.length;
    console.log(`   ✅ ${backup.stats.programs} programs`);

    // 3. Courses
    console.log('📦 Backing up Courses...');
    backup.data.courses = await prisma.course.findMany();
    backup.stats.courses = backup.data.courses.length;
    console.log(`   ✅ ${backup.stats.courses} courses`);

    // 4. Students
    console.log('📦 Backing up Students...');
    backup.data.students = await prisma.student.findMany();
    backup.stats.students = backup.data.students.length;
    console.log(`   ✅ ${backup.stats.students} students`);

    // 5. Enrollment Requests
    console.log('📦 Backing up EnrollmentRequests...');
    backup.data.enrollmentRequests = await prisma.enrollmentRequest.findMany();
    backup.stats.enrollmentRequests = backup.data.enrollmentRequests.length;
    console.log(`   ✅ ${backup.stats.enrollmentRequests} enrollment requests`);

    // 6. Enrollments
    console.log('📦 Backing up Enrollments...');
    backup.data.enrollments = await prisma.enrollment.findMany();
    backup.stats.enrollments = backup.data.enrollments.length;
    console.log(`   ✅ ${backup.stats.enrollments} enrollments`);

    // 7. Attendance
    console.log('📦 Backing up Attendance...');
    backup.data.attendance = await prisma.attendance.findMany();
    backup.stats.attendance = backup.data.attendance.length;
    console.log(`   ✅ ${backup.stats.attendance} attendance records`);

    // 8. Daily Grades
    console.log('📦 Backing up DailyGrades...');
    backup.data.dailyGrades = await prisma.dailyGrade.findMany();
    backup.stats.dailyGrades = backup.data.dailyGrades.length;
    console.log(`   ✅ ${backup.stats.dailyGrades} daily grades`);

    // 9. Weekly Grades
    console.log('📦 Backing up WeeklyGrades...');
    backup.data.weeklyGrades = await prisma.weeklyGrade.findMany();
    backup.stats.weeklyGrades = backup.data.weeklyGrades.length;
    console.log(`   ✅ ${backup.stats.weeklyGrades} weekly grades`);

    // 10. Monthly Grades
    console.log('📦 Backing up MonthlyGrades...');
    backup.data.monthlyGrades = await prisma.monthlyGrade.findMany();
    backup.stats.monthlyGrades = backup.data.monthlyGrades.length;
    console.log(`   ✅ ${backup.stats.monthlyGrades} monthly grades`);

    // 11. Final Exams
    console.log('📦 Backing up FinalExams...');
    backup.data.finalExams = await prisma.finalExam.findMany();
    backup.stats.finalExams = backup.data.finalExams.length;
    console.log(`   ✅ ${backup.stats.finalExams} final exams`);

    // 12. Behavior Grades
    console.log('📦 Backing up BehaviorGrades...');
    backup.data.behaviorGrades = await prisma.behaviorGrade.findMany();
    backup.stats.behaviorGrades = backup.data.behaviorGrades.length;
    console.log(`   ✅ ${backup.stats.behaviorGrades} behavior grades`);

    // 13. Daily Tasks
    console.log('📦 Backing up DailyTasks...');
    backup.data.dailyTasks = await prisma.dailyTask.findMany();
    backup.stats.dailyTasks = backup.data.dailyTasks.length;
    console.log(`   ✅ ${backup.stats.dailyTasks} daily tasks`);

    // 14. Behavior Points
    console.log('📦 Backing up BehaviorPoints...');
    backup.data.behaviorPoints = await prisma.behaviorPoint.findMany();
    backup.stats.behaviorPoints = backup.data.behaviorPoints.length;
    console.log(`   ✅ ${backup.stats.behaviorPoints} behavior points`);

    // 15. Public Site Settings
    console.log('📦 Backing up PublicSiteSettings...');
    backup.data.publicSiteSettings = await prisma.publicSiteSettings.findMany();
    backup.stats.publicSiteSettings = backup.data.publicSiteSettings.length;
    console.log(`   ✅ ${backup.stats.publicSiteSettings} site settings`);

    // Calculate totals
    backup.stats.totalRecords = Object.values(backup.stats).reduce((a, b) => a + b, 0);

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', filename);

    // Write backup file
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf8');

    console.log('\n' + '='.repeat(50));
    console.log('✅ BACKUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Total records: ${backup.stats.totalRecords.toLocaleString()}`);
    console.log(`📦 File size: ${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`);
    console.log('='.repeat(50));

    // Print summary table
    console.log('\n📋 Backup Summary:');
    console.log('-'.repeat(40));
    Object.entries(backup.stats).forEach(([key, value]) => {
      if (key !== 'totalRecords') {
        console.log(`   ${key.padEnd(25)} ${value.toLocaleString().padStart(10)}`);
      }
    });
    console.log('-'.repeat(40));
    console.log(`   ${'TOTAL'.padEnd(25)} ${backup.stats.totalRecords.toLocaleString().padStart(10)}`);

    return filepath;

  } catch (error) {
    console.error('\n❌ BACKUP FAILED!');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n⚠️  Connection failed. The database may no longer be accessible.');
      console.error('    This could mean the attacker has changed the credentials.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup
backupDatabase();
