import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@roxiler.com',
    },
    update: {
      password,
      role: 'SYSTEM_ADMIN',
    },
    create: {
      name: 'Roxiler System Administrator',
      email: 'admin@roxiler.com',
      password,
      address: 'Roxiler Headquarters',
      role: 'SYSTEM_ADMIN',
    },
  });

  console.log('Admin created:', admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });