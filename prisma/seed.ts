import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required to seed an administrator.');
  }

  if (adminPassword.length < 14) {
    throw new Error('ADMIN_SEED_PASSWORD must be at least 14 characters long.');
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.siteConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroTitle: '极致性能\n驱动工业未来',
      heroSub: '基于工业美学与严谨制造体系，苏州南瓷为您打造高可靠的电力配套设备解决方案。',
    },
  });

  console.log('Seed completed successfully via Driver Adapter');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
