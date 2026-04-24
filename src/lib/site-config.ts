import 'server-only';

import { withDatabaseRetry } from '@/lib/db-retry';
import { prisma } from '@/lib/prisma';

export type SiteConfigRecord = {
  id: string;
  heroTitle: string | null;
  heroSub: string | null;
  contactMail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  wechatQrUrl: string | null;
  updatedAt: Date | null;
};

type SiteConfigRow = {
  id: string;
  heroTitle: string | null;
  heroSub: string | null;
  contactMail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  wechatQrUrl: string | null;
  updatedAt: Date | null;
};

let siteConfigColumnsReady: Promise<void> | null = null;

function ensureSiteConfigColumns() {
  siteConfigColumnsReady ??= withDatabaseRetry(() =>
    prisma.$executeRawUnsafe(`
      ALTER TABLE "SiteConfig"
        ADD COLUMN IF NOT EXISTS "contactPhone" TEXT NOT NULL DEFAULT '+86 400-888-9999',
        ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT NOT NULL DEFAULT '+86 138-0000-0000',
        ADD COLUMN IF NOT EXISTS "wechatQrUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP
    `)
  )
    .then(() => undefined)
    .catch((error) => {
      siteConfigColumnsReady = null;
      throw error;
    });

  return siteConfigColumnsReady;
}

export async function getSiteConfig(): Promise<SiteConfigRecord | null> {
  await ensureSiteConfigColumns();

  const rows = await withDatabaseRetry(() =>
    prisma.$queryRawUnsafe<SiteConfigRow[]>(
      'SELECT id, "heroTitle", "heroSub", "contactMail", "contactPhone", "whatsappNumber", "wechatQrUrl", "updatedAt" FROM "SiteConfig" WHERE id = $1 LIMIT 1',
      'default'
    )
  );

  return rows[0] ?? null;
}

export async function saveSiteConfig(input: Omit<SiteConfigRecord, 'updatedAt'>) {
  await ensureSiteConfigColumns();

  await withDatabaseRetry(() =>
    prisma.$executeRawUnsafe(
      `
        INSERT INTO "SiteConfig" (
          id,
          "heroTitle",
          "heroSub",
          "contactMail",
          "contactPhone",
          "whatsappNumber",
          "wechatQrUrl",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          "heroTitle" = EXCLUDED."heroTitle",
          "heroSub" = EXCLUDED."heroSub",
          "contactMail" = EXCLUDED."contactMail",
          "contactPhone" = EXCLUDED."contactPhone",
          "whatsappNumber" = EXCLUDED."whatsappNumber",
          "wechatQrUrl" = EXCLUDED."wechatQrUrl",
          "updatedAt" = CURRENT_TIMESTAMP
      `,
      input.id,
      input.heroTitle,
      input.heroSub,
      input.contactMail,
      input.contactPhone,
      input.whatsappNumber,
      input.wechatQrUrl
    )
  );
}
