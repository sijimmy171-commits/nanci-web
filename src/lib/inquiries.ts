import 'server-only';

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export const inquiryStatuses = ['PENDING', 'READ', 'REPLIED'] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];
export const inquiryNotificationStatuses = ['PENDING', 'SENT', 'FAILED'] as const;
export type InquiryNotificationStatus = (typeof inquiryNotificationStatuses)[number];

export type InquiryRecord = {
  id: string;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  companyName: string | null;
  productType: string;
  message: string;
  status: string;
  notificationStatus: InquiryNotificationStatus;
  notificationAttempts: number;
  notificationSentAt: Date | null;
  notificationError: string | null;
  createdAt: Date;
};

type InquiryRow = {
  id: string;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  companyName: string | null;
  productType: string;
  message: string;
  status: string;
  notificationStatus: string | null;
  notificationAttempts: number | null;
  notificationSentAt: Date | null;
  notificationError: string | null;
  createdAt: Date;
};

let inquiryColumnsReady: Promise<void> | null = null;

export async function ensureInquiryColumns() {
  if (!inquiryColumnsReady) {
    inquiryColumnsReady = prisma
      .$executeRawUnsafe(`
        ALTER TABLE "Inquiry"
          ADD COLUMN IF NOT EXISTS "phone" TEXT,
          ADD COLUMN IF NOT EXISTS "notificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
          ADD COLUMN IF NOT EXISTS "notificationAttempts" INTEGER NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS "notificationSentAt" TIMESTAMP(3),
          ADD COLUMN IF NOT EXISTS "notificationError" TEXT
      `)
      .then(() => undefined)
      .catch((error) => {
        inquiryColumnsReady = null;
        throw error;
      });
  }

  await inquiryColumnsReady;
}

export function isInquiryStatus(value: string | null | undefined): value is InquiryStatus {
  return inquiryStatuses.includes(value as InquiryStatus);
}

export function isInquiryNotificationStatus(value: string | null | undefined): value is InquiryNotificationStatus {
  return inquiryNotificationStatuses.includes(value as InquiryNotificationStatus);
}

function mapInquiryRow(row: InquiryRow): InquiryRecord {
  return {
    ...row,
    notificationStatus: isInquiryNotificationStatus(row.notificationStatus) ? row.notificationStatus : 'PENDING',
    notificationAttempts: row.notificationAttempts ?? 0,
  };
}

export async function createInquiryRecord(input: {
  clientName: string;
  clientEmail: string;
  phone?: string | null;
  companyName?: string | null;
  productType: string;
  message: string;
}) {
  await ensureInquiryColumns();

  const id = randomUUID();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "Inquiry" (
        id,
        "clientName",
        "clientEmail",
        phone,
        "companyName",
        "productType",
        message,
        status,
        "createdAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', NOW())
    `,
    id,
    input.clientName,
    input.clientEmail,
    input.phone || null,
    input.companyName || null,
    input.productType,
    input.message
  );

  return id;
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  await ensureInquiryColumns();

  const rows = await prisma.$queryRawUnsafe<InquiryRow[]>(
    `
      SELECT
        id,
        "clientName",
        "clientEmail",
        phone,
        "companyName",
        "productType",
        message,
        status,
        "notificationStatus" AS "notificationStatus",
        "notificationAttempts" AS "notificationAttempts",
        "notificationSentAt" AS "notificationSentAt",
        "notificationError" AS "notificationError",
        "createdAt"
      FROM "Inquiry"
      ORDER BY "createdAt" DESC
    `
  );

  return rows.map(mapInquiryRow);
}

export async function getInquiryById(id: string): Promise<InquiryRecord | null> {
  await ensureInquiryColumns();
  const rows = await prisma.$queryRawUnsafe<InquiryRow[]>(
    `
      SELECT id, "clientName", "clientEmail", phone, "companyName", "productType", message, status,
        "notificationStatus", "notificationAttempts", "notificationSentAt", "notificationError", "createdAt"
      FROM "Inquiry"
      WHERE id = $1
      LIMIT 1
    `,
    id
  );

  return rows[0] ? mapInquiryRow(rows[0]) : null;
}

export async function recordInquiryNotificationResult(
  id: string,
  result: { success: true } | { success: false; error: string }
) {
  await ensureInquiryColumns();
  const error = result.success ? null : result.error.slice(0, 1000);

  await prisma.$executeRawUnsafe(
    `
      UPDATE "Inquiry"
      SET "notificationStatus" = $1,
          "notificationAttempts" = "notificationAttempts" + 1,
          "notificationSentAt" = CASE WHEN $1 = 'SENT' THEN CURRENT_TIMESTAMP ELSE "notificationSentAt" END,
          "notificationError" = $2
      WHERE id = $3
    `,
    result.success ? 'SENT' : 'FAILED',
    error,
    id
  );
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await ensureInquiryColumns();

  await prisma.$executeRawUnsafe(
    `
      UPDATE "Inquiry"
      SET status = $1
      WHERE id = $2
    `,
    status,
    id
  );
}

export async function getInquiryStatusCounts() {
  await ensureInquiryColumns();

  const rows = await prisma.$queryRawUnsafe<Array<{ status: string; count: bigint | number }>>(
    `
      SELECT status, COUNT(*) AS count
      FROM "Inquiry"
      GROUP BY status
    `
  );

  const initial = {
    total: 0,
    PENDING: 0,
    READ: 0,
    REPLIED: 0,
  };

  for (const row of rows) {
    const count = typeof row.count === 'bigint' ? Number(row.count) : Number(row.count);
    initial.total += count;
    if (isInquiryStatus(row.status)) {
      initial[row.status] = count;
    }
  }

  return initial;
}
