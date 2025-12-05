/**
 * Database Restore Script
 * =======================
 * Restores data from backup JSON file to Supabase using MCP.
 * 
 * Usage: node scripts/restore-database.js [backup-file.json]
 */

const fs = require('fs');
const path = require('path');

async function main() {
  // Find the backup file
  const backupFile = process.argv[2] || findLatestBackup();
  
  if (!backupFile) {
    console.error('❌ No backup file found. Usage: node scripts/restore-database.js backup-file.json');
    process.exit(1);
  }

  console.log(`📂 Loading backup from: ${backupFile}`);
  
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  
  console.log('\n📊 Backup Summary:');
  console.log('==================');
  Object.entries(backup.stats).forEach(([key, value]) => {
    if (key !== 'totalRecords') {
      console.log(`  ${key}: ${value}`);
    }
  });
  console.log(`  TOTAL: ${backup.stats.totalRecords}`);
  
  // Generate SQL insert statements
  console.log('\n📝 Generating SQL statements...\n');
  
  // 1. Users
  if (backup.data.users && backup.data.users.length > 0) {
    console.log('-- USERS');
    backup.data.users.forEach(user => {
      const sql = `INSERT INTO "User" ("id", "userName", "userEmail", "passwordHash", "userRole", "isActive", "createdAt", "updatedAt") VALUES ('${user.id}', '${escapeSql(user.userName)}', '${escapeSql(user.userEmail)}', '${escapeSql(user.passwordHash)}', '${user.userRole}', ${user.isActive}, '${user.createdAt}', '${user.updatedAt}') ON CONFLICT ("id") DO NOTHING;`;
      console.log(sql);
    });
    console.log('');
  }

  // 2. Programs
  if (backup.data.programs && backup.data.programs.length > 0) {
    console.log('-- PROGRAMS');
    backup.data.programs.forEach(prog => {
      const sql = `INSERT INTO "Program" ("id", "programName", "programDescription", "isActive", "createdAt", "updatedAt") VALUES ('${prog.id}', '${escapeSql(prog.programName)}', ${prog.programDescription ? `'${escapeSql(prog.programDescription)}'` : 'NULL'}, ${prog.isActive}, '${prog.createdAt}', '${prog.updatedAt}') ON CONFLICT ("id") DO NOTHING;`;
      console.log(sql);
    });
    console.log('');
  }

  // 3. Courses
  if (backup.data.courses && backup.data.courses.length > 0) {
    console.log('-- COURSES');
    backup.data.courses.forEach(course => {
      const sql = `INSERT INTO "Course" ("id", "courseName", "courseDescription", "programId", "teacherId", "maxStudents", "isActive", "createdAt", "updatedAt") VALUES ('${course.id}', '${escapeSql(course.courseName)}', ${course.courseDescription ? `'${escapeSql(course.courseDescription)}'` : 'NULL'}, '${course.programId}', ${course.teacherId ? `'${course.teacherId}'` : 'NULL'}, ${course.maxStudents}, ${course.isActive}, '${course.createdAt}', '${course.updatedAt}') ON CONFLICT ("id") DO NOTHING;`;
      console.log(sql);
    });
    console.log('');
  }

  // 4. Students
  if (backup.data.students && backup.data.students.length > 0) {
    console.log('-- STUDENTS');
    backup.data.students.forEach(student => {
      const sql = `INSERT INTO "Student" ("id", "userId", "studentName", "studentPhone", "studentGrade", "parentPhone", "enrollmentDate", "createdAt", "updatedAt") VALUES ('${student.id}', '${student.userId}', '${escapeSql(student.studentName)}', ${student.studentPhone ? `'${escapeSql(student.studentPhone)}'` : 'NULL'}, ${student.studentGrade ? `'${escapeSql(student.studentGrade)}'` : 'NULL'}, ${student.parentPhone ? `'${escapeSql(student.parentPhone)}'` : 'NULL'}, '${student.enrollmentDate}', '${student.createdAt}', '${student.updatedAt}') ON CONFLICT ("id") DO NOTHING;`;
      console.log(sql);
    });
    console.log('');
  }

  console.log('\n✅ SQL statements generated. Copy and run them in Supabase SQL Editor.');
  console.log('\n⚠️ For large datasets, use the batch restore script or MCP tools.');
}

function findLatestBackup() {
  const files = fs.readdirSync(process.cwd())
    .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  return files[0] || null;
}

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

main();
