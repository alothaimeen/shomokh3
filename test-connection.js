const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();

p.user.count()
  .then(c => console.log('Users:', c))
  .catch(e => console.error('Error:', e.message))
  .finally(() => p.$disconnect());
