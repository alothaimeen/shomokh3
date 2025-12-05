/**
 * Users Table Deep Investigation
 * ===============================
 * تحليل مشكلة جدول users الذي يحتوي على 43 عمود بدلاً من 8
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateUsersTable() {
    console.log('\n🔬 تحقيق معمق في جدول users...\n');
    console.log('═'.repeat(70) + '\n');

    try {
        // 1. فحص جميع الـ schemas في قاعدة البيانات
        console.log('📋 1. الـ Schemas الموجودة في قاعدة البيانات:');
        console.log('─'.repeat(70));

        const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      ORDER BY schema_name;
    `;
        schemas.forEach(s => console.log(`  📁 ${s.schema_name}`));

        // 2. البحث عن جميع الجداول المسماة users في كل schema
        console.log('\n\n📋 2. جميع الجداول المسماة "users" في كل الـ schemas:');
        console.log('─'.repeat(70));

        const usersTables = await prisma.$queryRaw`
      SELECT 
        table_schema, 
        table_name,
        (SELECT count(*) FROM information_schema.columns c 
         WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_name = 'users'
      ORDER BY table_schema;
    `;

        usersTables.forEach(t => {
            console.log(`  📁 ${t.table_schema}.${t.table_name} (${t.column_count} أعمدة)`);
        });

        // 3. فحص أعمدة public.users بالتفصيل
        console.log('\n\n📋 3. تفاصيل أعمدة public.users:');
        console.log('─'.repeat(70));

        const publicUsersColumns = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `;

        // تقسيم الأعمدة حسب ما هو متوقع في Prisma
        const expectedColumns = ['id', 'userName', 'userEmail', 'passwordHash', 'userRole', 'isActive', 'createdAt', 'updatedAt'];
        const prismaColumns = [];
        const extraColumns = [];

        publicUsersColumns.forEach(col => {
            if (expectedColumns.includes(col.column_name)) {
                prismaColumns.push(col);
            } else {
                extraColumns.push(col);
            }
        });

        console.log('\n  ✅ أعمدة Prisma المتوقعة (' + prismaColumns.length + '):');
        prismaColumns.forEach(col => {
            console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        console.log('\n  ⚠️ أعمدة إضافية غير متوقعة (' + extraColumns.length + '):');
        extraColumns.forEach(col => {
            console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        // 4. فحص auth.users إذا وُجد
        console.log('\n\n📋 4. فحص auth.users (Supabase Auth):');
        console.log('─'.repeat(70));

        try {
            const authUsersColumns = await prisma.$queryRaw`
        SELECT 
          column_name, 
          data_type
        FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users'
        ORDER BY ordinal_position;
      `;

            console.log(`  ✅ auth.users موجود (${authUsersColumns.length} عمود)`);

            // مقارنة الأعمدة المكررة
            const authColumnNames = authUsersColumns.map(c => c.column_name);
            const publicColumnNames = publicUsersColumns.map(c => c.column_name);

            const duplicateColumns = publicColumnNames.filter(c => authColumnNames.includes(c));

            if (duplicateColumns.length > 0) {
                console.log(`\n  🔄 أعمدة مكررة بين public.users و auth.users:`);
                duplicateColumns.forEach(col => console.log(`     - ${col}`));
            }

        } catch (e) {
            console.log('  ❌ auth.users غير موجود أو لا يمكن الوصول إليه');
        }

        // 5. فحص Foreign Keys
        console.log('\n\n📋 5. العلاقات الأجنبية (Foreign Keys) المرتبطة بـ users:');
        console.log('─'.repeat(70));

        const fks = await prisma.$queryRaw`
      SELECT
        tc.table_schema,
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
      AND (ccu.table_name = 'users' OR tc.table_name = 'users');
    `;

        fks.forEach(fk => {
            console.log(`  🔗 ${fk.table_schema}.${fk.table_name}.${fk.column_name} → ${fk.foreign_table_schema}.${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });

        // 6. فحص Views
        console.log('\n\n📋 6. Views المرتبطة بـ users:');
        console.log('─'.repeat(70));

        const views = await prisma.$queryRaw`
      SELECT table_schema, table_name, view_definition
      FROM information_schema.views 
      WHERE view_definition ILIKE '%users%'
      LIMIT 10;
    `;

        if (views.length > 0) {
            views.forEach(v => console.log(`  👁️ ${v.table_schema}.${v.table_name}`));
        } else {
            console.log('  (لا توجد views)');
        }

        // 7. فحص Triggers
        console.log('\n\n📋 7. Triggers على جدول users:');
        console.log('─'.repeat(70));

        const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'users'
      AND event_object_schema = 'public';
    `;

        if (triggers.length > 0) {
            triggers.forEach(t => console.log(`  ⚡ ${t.trigger_name} (${t.event_manipulation})`));
        } else {
            console.log('  (لا توجد triggers)');
        }

        // 8. فحص عدد السجلات
        console.log('\n\n📋 8. عدد السجلات:');
        console.log('─'.repeat(70));

        const publicCount = await prisma.$queryRaw`SELECT count(*) as count FROM public.users;`;
        console.log(`  📊 public.users: ${publicCount[0].count} سجل`);

        try {
            const authCount = await prisma.$queryRaw`SELECT count(*) as count FROM auth.users;`;
            console.log(`  📊 auth.users: ${authCount[0].count} سجل`);
        } catch (e) {
            console.log('  ❌ لا يمكن الوصول إلى auth.users');
        }

        // 9. التشخيص النهائي
        console.log('\n\n' + '═'.repeat(70));
        console.log('🔍 التشخيص:');
        console.log('═'.repeat(70));

        if (extraColumns.length > 0) {
            console.log(`
  🚨 المشكلة:
     جدول public.users يحتوي على ${extraColumns.length} عمود إضافي
     من المحتمل أن:
     1. تم تشغيل 'prisma db push' على schema قديم أو مختلف
     2. Supabase أضاف أعمدة auth تلقائياً
     3. حدث دمج غير مقصود بين auth.users و public.users

  💡 الحل المقترح:
     1. إعادة إنشاء جدول users بالهيكل الصحيح
     2. نقل البيانات الموجودة
     3. حذف الجدول القديم وإعادة تسميته

  ⚠️ تحذير:
     هذه العملية تحتاج حذراً شديداً لتجنب فقدان البيانات!
      `);
        } else {
            console.log('\n  ✅ لا توجد أعمدة إضافية - الجدول سليم');
        }

    } catch (error) {
        console.error('\n❌ خطأ:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

investigateUsersTable();
