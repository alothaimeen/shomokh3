const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPublicSettingsTable() {
  console.log('🔧 Creating public_site_settings table...');

  try {
    // إنشاء الجدول
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public_site_settings (
        id TEXT PRIMARY KEY,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        "studentsCount" INTEGER NOT NULL DEFAULT 0,
        "teachersCount" INTEGER NOT NULL DEFAULT 0,
        "coursesCount" INTEGER NOT NULL DEFAULT 0,
        "facesCompleted" INTEGER NOT NULL DEFAULT 0,
        
        "aboutTitle" TEXT NOT NULL DEFAULT 'عن الجمعية',
        "aboutVision" TEXT NOT NULL DEFAULT 'جمعية رائدة لتعليم مستمر، بأساليب مبتكرة',
        "aboutMission" TEXT NOT NULL DEFAULT 'تعليم القرآن الكريم وتحفيظه، وترسيخ القيم والأخلاق الإسلامية',
        "aboutGoals" TEXT NOT NULL DEFAULT 'تعليم القرآن الكريم وفق المنهج النبوي',
        
        "achievementsTitle" TEXT NOT NULL DEFAULT 'إنجازاتنا',
        "achievementsText" TEXT NOT NULL DEFAULT 'أكثر من 11 ألف طالبة و2 مليون وجه منجز',
        
        "contactTitle" TEXT NOT NULL DEFAULT 'تواصل معنا',
        "contactEmail" TEXT NOT NULL DEFAULT '',
        "contactPhone" TEXT NOT NULL DEFAULT '',
        "contactAddress" TEXT NOT NULL DEFAULT '',
        "contactWhatsapp" TEXT NOT NULL DEFAULT '',
        
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastEditedById" TEXT
      );
    `);

    console.log('✅ Table created successfully!');

    // إدراج بيانات افتراضية
    const existingSettings = await prisma.$queryRaw`
      SELECT id FROM public_site_settings LIMIT 1
    `;

    if (!existingSettings || existingSettings.length === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO public_site_settings (
          id, 
          "createdAt", 
          "updatedAt",
          "studentsCount",
          "teachersCount",
          "coursesCount",
          "facesCompleted",
          "aboutTitle",
          "aboutVision",
          "aboutMission",
          "aboutGoals",
          "achievementsTitle",
          "achievementsText",
          "contactTitle",
          "contactEmail",
          "contactPhone",
          "contactAddress",
          "contactWhatsapp"
        ) VALUES (
          'default-settings',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          150,
          12,
          8,
          50000,
          'عن الجمعية',
          'جمعية رائدة في تعليم القرآن الكريم بأساليب حديثة ومبتكرة',
          'تعليم القرآن الكريم وتحفيظه وترسيخ القيم والأخلاق الإسلامية في نفوس الطالبات',
          'تعليم القرآن الكريم وفق المنهج النبوي
إعداد جيل قرآني متميز
غرس القيم الإسلامية الأصيلة
تخريج حافظات لكتاب الله',
          'إنجازاتنا',
          'أكثر من 11 ألف طالبة تخرجت من حلقاتنا، وأكثر من 2 مليون وجه منجز بفضل الله',
          'تواصل معنا',
          'info@shomokh.edu.sa',
          '+966 XX XXX XXXX',
          'المملكة العربية السعودية',
          '+966 XX XXX XXXX'
        );
      `);
      console.log('✅ Default settings inserted!');
    } else {
      console.log('ℹ️ Settings already exist, skipping insert.');
    }

    console.log('🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPublicSettingsTable();
