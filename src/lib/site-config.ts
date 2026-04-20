import 'server-only';

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

export async function getSiteConfig(): Promise<SiteConfigRecord | null> {
  const rows = await prisma.$queryRawUnsafe<SiteConfigRow[]>(
    'SELECT id, "heroTitle", "heroSub", "contactMail", "contactPhone", "whatsappNumber", "wechatQrUrl", "updatedAt" FROM "SiteConfig" WHERE id = $1 LIMIT 1',
    'default'
  );

  return rows[0] ?? null;
}

export async function saveSiteConfig(input: Omit<SiteConfigRecord, 'updatedAt'>) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "SiteConfig" (
        id,
        "heroTitle",
        "heroSub",
        "contactMail",
        "contactPhone",
        "whatsappNumber",
        "wechatQrUrl"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        "heroTitle" = EXCLUDED."heroTitle",
        "heroSub" = EXCLUDED."heroSub",
        "contactMail" = EXCLUDED."contactMail",
        "contactPhone" = EXCLUDED."contactPhone",
        "whatsappNumber" = EXCLUDED."whatsappNumber",
        "wechatQrUrl" = EXCLUDED."wechatQrUrl"
    `,
    input.id,
    input.heroTitle,
    input.heroSub,
    input.contactMail,
    input.contactPhone,
    input.whatsappNumber,
    input.wechatQrUrl
  );
}
