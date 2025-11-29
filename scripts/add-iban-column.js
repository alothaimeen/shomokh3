const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addIbanColumn() {
  console.log('🔧 Adding contactIban column...');

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public_site_settings 
      ADD COLUMN IF NOT EXISTS "contactIban" TEXT NOT NULL DEFAULT ''
    `);
    console.log('✅ Column added successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addIbanColumn();
