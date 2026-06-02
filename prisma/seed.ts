import * as dotenv from 'dotenv';
dotenv.config();

const { PrismaClient } = require('../generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@moti.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';

  const existing = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (existing) {
    console.log('SUPER_ADMIN already exists:', existing.email);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('SUPER_ADMIN created:', user.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
