/**
 * سكربت إعادة تهيئة قاعدة البيانات (Database Reset)
 * ==================================================
 * يمسح كل البيانات ويُنشئ الحسابات الأساسية فقط
 * 
 * ⚠️ تحذير: هذا السكربت يمسح كل البيانات!
 * 
 * Usage: node scripts/reset-database.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ==================== ACCOUNTS TO CREATE ====================

const ACCOUNTS = [
    {
        userName: 'مدير النظام',
        userEmail: 'admin@shamokh.edu',
        password: 'admin123',
        userRole: 'ADMIN'
    },
    {
        userName: 'المعلمة التجريبية',
        userEmail: 'teacher1@shamokh.edu',
        password: 'teacher123',
        userRole: 'TEACHER'
    },
    {
        userName: 'الطالبة التجريبية',
        userEmail: 'student1@shamokh.edu',
        password: 'student123',
        userRole: 'STUDENT'
    }
];

// ==================== MAIN ====================

async function main() {
    console.log('\n⚠️  سكربت إعادة تهيئة قاعدة البيانات\n');
    console.log('='.repeat(50));

    const startTime = Date.now();

    // ==================== 1. DELETE ALL DATA ====================
    console.log('\n🗑️  مسح البيانات...\n');

    // Delete in correct order (child tables first)
    const tables = [
        { name: 'behaviorPoint', label: 'نقاط السلوك' },
        { name: 'behaviorGrade', label: 'درجات السلوك' },
        { name: 'dailyTask', label: 'المهام اليومية' },
        { name: 'finalExam', label: 'الاختبارات النهائية' },
        { name: 'monthlyGrade', label: 'الدرجات الشهرية' },
        { name: 'weeklyGrade', label: 'الدرجات الأسبوعية' },
        { name: 'dailyGrade', label: 'الدرجات اليومية' },
        { name: 'attendance', label: 'الحضور' },
        { name: 'enrollment', label: 'التسجيلات' },
        { name: 'enrollmentRequest', label: 'طلبات التسجيل' },
        { name: 'student', label: 'الطالبات' },
        { name: 'course', label: 'الحلقات' },
        { name: 'program', label: 'البرامج' },
        { name: 'publicSiteSettings', label: 'إعدادات الموقع' },
        { name: 'user', label: 'المستخدمين' }
    ];

    for (const table of tables) {
        try {
            const result = await prisma[table.name].deleteMany({});
            console.log(`  ✅ ${table.label}: ${result.count} سجل`);
        } catch (e) {
            console.log(`  ⚠️ ${table.label}: ${e.message}`);
        }
    }

    // ==================== 2. CREATE ACCOUNTS ====================
    console.log('\n👤 إنشاء الحسابات الأساسية...\n');

    for (const account of ACCOUNTS) {
        const passwordHash = await bcrypt.hash(account.password, 10);

        await prisma.user.create({
            data: {
                userName: account.userName,
                userEmail: account.userEmail,
                passwordHash: passwordHash,
                userRole: account.userRole,
                isActive: true
            }
        });

        console.log(`  ✅ ${account.userRole.padEnd(8)} ${account.userEmail}`);
    }

    // ==================== 3. CREATE DEFAULT SITE SETTINGS ====================
    console.log('\n⚙️  إنشاء إعدادات الموقع...');

    await prisma.publicSiteSettings.create({
        data: {
            studentsCount: 0,
            teachersCount: 0,
            coursesCount: 0,
            facesCompleted: 0,
            aboutVision: 'رؤيتنا',
            aboutMission: 'رسالتنا',
            aboutGoals: 'أهدافنا',
            contactEmail: 'info@shamokh.edu',
            contactPhone: '0500000000',
            isActive: true
        }
    });
    console.log('  ✅ تم');

    // ==================== SUMMARY ====================
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('✅ تمت إعادة التهيئة بنجاح!');
    console.log('='.repeat(50));
    console.log(`
📊 الحسابات المُنشأة:
   👨‍💼 المدير:   admin@shamokh.edu    / admin123
   👩‍🏫 المعلمة:  teacher1@shamokh.edu / teacher123
   👧 الطالبة:  student1@shamokh.edu / student123

⏱️ الوقت: ${duration}s
`);
    console.log('='.repeat(50));
    console.log('\n💡 الخطوة التالية: node scripts/seed_simulation.js\n');
}

main()
    .catch((e) => { console.error('❌ خطأ:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
