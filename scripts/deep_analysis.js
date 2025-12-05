/**
 * Deep Database Analysis Script
 * =============================
 * تحليل معمق لقاعدة البيانات للكشف عن:
 * 1. أي جداول إضافية (غير موجودة في Prisma)
 * 2. سلامة العلاقات بين الجداول
 * 3. البيانات اليتيمة (orphaned records)
 * 4. مقارنة مع النسخة الاحتياطية
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function deepAnalysis() {
    console.log('\n🔬 تحليل معمق لقاعدة البيانات...\n');
    console.log('═'.repeat(60) + '\n');

    try {
        // 1. الحصول على جميع الجداول من PostgreSQL
        console.log('📋 1. الجداول في PostgreSQL (بما فيها غير المُعرّفة في Prisma):');
        console.log('─'.repeat(60));

        const allTables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

        const prismaModels = [
            'users', 'programs', 'courses', 'students',
            'enrollment_requests', 'enrollments', 'attendance',
            'daily_grades', 'weekly_grades', 'monthly_grades',
            'final_exams', 'behavior_grades', 'daily_tasks',
            'behavior_points', 'public_site_settings'
        ];

        const extraTables = [];
        const expectedTables = [];

        allTables.forEach(t => {
            const isPrisma = prismaModels.includes(t.table_name);
            const prefix = isPrisma ? '  ✅' : '  ⚠️ ';
            console.log(`${prefix} ${t.table_name} (${t.column_count} أعمدة)`);

            if (!isPrisma) {
                extraTables.push(t.table_name);
            } else {
                expectedTables.push(t.table_name);
            }
        });

        if (extraTables.length > 0) {
            console.log('\n  🚨 جداول إضافية غير موجودة في Prisma:');
            extraTables.forEach(t => console.log(`     ❓ ${t}`));
        }

        const missingFromDB = prismaModels.filter(p => !expectedTables.includes(p));
        if (missingFromDB.length > 0) {
            console.log('\n  ⛔ جداول مفقودة من قاعدة البيانات:');
            missingFromDB.forEach(t => console.log(`     ❌ ${t}`));
        }

        // 2. فحص أعمدة كل جدول
        console.log('\n\n📊 2. تفاصيل أعمدة الجداول:');
        console.log('─'.repeat(60));

        for (const table of allTables) {
            const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = ${table.table_name}
        ORDER BY ordinal_position;
      `;

            console.log(`\n  📁 ${table.table_name}:`);
            columns.forEach(col => {
                console.log(`     - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' [NOT NULL]' : ''}`);
            });
        }

        // 3. فحص العلاقات والبيانات اليتيمة
        console.log('\n\n🔗 3. فحص سلامة العلاقات:');
        console.log('─'.repeat(60));

        // طلبات تسجيل بدون طالبات
        const orphanedEnrollmentRequests = await prisma.$queryRaw`
      SELECT count(*) as count FROM enrollment_requests er 
      WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id = er."studentId");
    `;
        console.log(`  📌 طلبات تسجيل بدون طالبات: ${orphanedEnrollmentRequests[0].count}`);

        // تسجيلات بدون طالبات
        const orphanedEnrollments = await prisma.$queryRaw`
      SELECT count(*) as count FROM enrollments e 
      WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id = e."studentId");
    `;
        console.log(`  📌 تسجيلات بدون طالبات: ${orphanedEnrollments[0].count}`);

        // حضور بدون طالبات
        const orphanedAttendance = await prisma.$queryRaw`
      SELECT count(*) as count FROM attendance a 
      WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id = a."studentId");
    `;
        console.log(`  📌 سجلات حضور بدون طالبات: ${orphanedAttendance[0].count}`);

        // درجات يومية بدون طالبات
        const orphanedDailyGrades = await prisma.$queryRaw`
      SELECT count(*) as count FROM daily_grades dg 
      WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id = dg."studentId");
    `;
        console.log(`  📌 درجات يومية بدون طالبات: ${orphanedDailyGrades[0].count}`);

        // حلقات بدون برامج
        const orphanedCourses = await prisma.$queryRaw`
      SELECT count(*) as count FROM courses c 
      WHERE NOT EXISTS (SELECT 1 FROM programs p WHERE p.id = c."programId");
    `;
        console.log(`  📌 حلقات بدون برامج: ${orphanedCourses[0].count}`);

        // طالبات بدون تسجيلات
        const studentsNoEnrollment = await prisma.$queryRaw`
      SELECT count(*) as count FROM students s 
      WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e."studentId" = s.id);
    `;
        console.log(`  📌 طالبات بدون تسجيلات: ${studentsNoEnrollment[0].count}`);

        // 4. مقارنة مع النسخة الاحتياطية
        console.log('\n\n📦 4. مقارنة مع النسخة الاحتياطية:');
        console.log('─'.repeat(60));

        const backupFile = 'backup-2025-12-05T06-35-20.json';
        if (fs.existsSync(backupFile)) {
            const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

            console.log('  النسخة الاحتياطية:');
            console.log(`    📅 تاريخ: ${backup.metadata?.createdAt || 'غير محدد'}`);
            console.log(`    📊 إجمالي السجلات: ${backup.stats?.totalRecords || 'غير محدد'}`);

            if (backup.stats) {
                console.log('\n  مقارنة السجلات:');
                console.log('  ─'.repeat(30));
                console.log('  الجدول'.padEnd(25) + '| النسخة'.padEnd(12) + '| الحالي'.padEnd(12) + '| الفرق');
                console.log('  ' + '─'.repeat(55));

                const currentCounts = {
                    users: await prisma.user.count(),
                    programs: await prisma.program.count(),
                    courses: await prisma.course.count(),
                    students: await prisma.student.count(),
                    enrollmentRequests: await prisma.enrollmentRequest.count(),
                    enrollments: await prisma.enrollment.count(),
                    attendance: await prisma.attendance.count(),
                    dailyGrades: await prisma.dailyGrade.count(),
                    weeklyGrades: await prisma.weeklyGrade.count(),
                    monthlyGrades: await prisma.monthlyGrade.count(),
                    finalExams: await prisma.finalExam.count(),
                    behaviorGrades: await prisma.behaviorGrade.count(),
                    dailyTasks: await prisma.dailyTask.count(),
                    behaviorPoints: await prisma.behaviorPoint.count(),
                    publicSiteSettings: await prisma.publicSiteSettings.count(),
                };

                let totalBackup = 0;
                let totalCurrent = 0;

                for (const [key, backupCount] of Object.entries(backup.stats)) {
                    if (key === 'totalRecords') continue;

                    const currentCount = currentCounts[key] || 0;
                    const diff = currentCount - backupCount;
                    const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
                    const diffEmoji = diff === 0 ? '✅' : (diff > 0 ? '📈' : '📉');

                    console.log(`  ${key.padEnd(23)} | ${String(backupCount).padEnd(10)} | ${String(currentCount).padEnd(10)} | ${diffEmoji} ${diffStr}`);

                    totalBackup += backupCount;
                    totalCurrent += currentCount;
                }

                console.log('  ' + '─'.repeat(55));
                const totalDiff = totalCurrent - totalBackup;
                console.log(`  ${'الإجمالي'.padEnd(23)} | ${String(totalBackup).padEnd(10)} | ${String(totalCurrent).padEnd(10)} | ${totalDiff >= 0 ? '📈' : '📉'} ${totalDiff}`);
            }
        } else {
            console.log(`  ⚠️ ملف النسخة الاحتياطية غير موجود: ${backupFile}`);
        }

        // 5. فحص إضافي للـ Sequences و Constraints
        console.log('\n\n🔧 5. البنية التحتية (Sequences & Constraints):');
        console.log('─'.repeat(60));

        const foreignKeys = await prisma.$queryRaw`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
    `;

        console.log(`  🔑 عدد العلاقات الأجنبية (Foreign Keys): ${foreignKeys.length}`);

        // 6. ملخص نهائي
        console.log('\n\n' + '═'.repeat(60));
        console.log('📋 الملخص النهائي:');
        console.log('═'.repeat(60));

        console.log(`  📁 إجمالي الجداول: ${allTables.length}`);
        console.log(`  ✅ جداول Prisma: ${expectedTables.length}`);
        console.log(`  ⚠️ جداول إضافية: ${extraTables.length}`);
        console.log(`  ❌ جداول مفقودة: ${missingFromDB.length}`);

        if (extraTables.length > 0) {
            console.log('\n  ⚠️ الجداول الإضافية قد تكون من Supabase أو ترحيل سابق');
        }

        if (missingFromDB.length === 0 && extraTables.length === 0) {
            console.log('\n  ✅ جميع الجداول متطابقة مع schema.prisma');
        }

    } catch (error) {
        console.error('\n❌ خطأ:', error.message);
        if (error.code) console.error('   كود الخطأ:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

deepAnalysis();
