const { PrismaClient } = require('@prisma/client');

async function checkTables() {
    const prisma = new PrismaClient();

    try {
        console.log('🔍 التحقق من الجداول في قاعدة البيانات...\n');

        // قائمة الجداول المتوقعة حسب schema.prisma
        const expectedTables = [
            { name: 'users', model: 'user' },
            { name: 'programs', model: 'program' },
            { name: 'courses', model: 'course' },
            { name: 'students', model: 'student' },
            { name: 'enrollment_requests', model: 'enrollmentRequest' },
            { name: 'enrollments', model: 'enrollment' },
            { name: 'attendance', model: 'attendance' },
            { name: 'daily_grades', model: 'dailyGrade' },
            { name: 'weekly_grades', model: 'weeklyGrade' },
            { name: 'monthly_grades', model: 'monthlyGrade' },
            { name: 'final_exams', model: 'finalExam' },
            { name: 'behavior_grades', model: 'behaviorGrade' },
            { name: 'daily_tasks', model: 'dailyTask' },
            { name: 'behavior_points', model: 'behaviorPoint' },
            { name: 'public_site_settings', model: 'publicSiteSettings' },
        ];

        console.log('📋 الجداول المتوقعة (حسب schema.prisma): ' + expectedTables.length);
        console.log('─'.repeat(60));

        // التحقق من كل جدول
        const results = [];

        for (const table of expectedTables) {
            try {
                const count = await prisma[table.model].count();
                results.push({ table: table.name, exists: true, count });
                console.log(`✅ ${table.name}: موجود (${count} سجل)`);
            } catch (error) {
                results.push({ table: table.name, exists: false, error: error.message });
                console.log(`❌ ${table.name}: غير موجود أو خطأ - ${error.message.slice(0, 100)}`);
            }
        }

        // الحصول على قائمة الجداول الفعلية من قاعدة البيانات
        console.log('\n' + '─'.repeat(60));
        console.log('📊 الجداول الموجودة فعلياً في قاعدة البيانات:');

        const actualTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

        console.log('\nالجداول الموجودة:');
        actualTables.forEach(t => console.log(`  📁 ${t.table_name}`));

        // المقارنة
        console.log('\n' + '─'.repeat(60));
        console.log('📈 ملخص:');
        console.log(`  - الجداول المتوقعة: ${expectedTables.length}`);
        console.log(`  - الجداول الموجودة: ${actualTables.length}`);

        const missingTables = expectedTables.filter(
            exp => !actualTables.some(act => act.table_name === exp.name)
        );

        if (missingTables.length > 0) {
            console.log('\n⚠️ الجداول المفقودة:');
            missingTables.forEach(t => console.log(`  ❌ ${t.name}`));
        } else {
            console.log('\n✅ جميع الجداول موجودة!');
        }

        // عدد السجلات في الجداول الرئيسية
        console.log('\n' + '─'.repeat(60));
        console.log('📊 إحصائيات البيانات:');

        const stats = results.filter(r => r.exists);
        stats.forEach(s => {
            console.log(`  ${s.table}: ${s.count} سجل`);
        });

    } catch (error) {
        console.error('❌ خطأ في الاتصال:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
