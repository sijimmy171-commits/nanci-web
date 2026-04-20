import 'server-only';

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export const inquiryStatuses = ['PENDING', 'READ', 'REPLIED'] as const;
export type InquiryStatus = (typeof inquiryStatuses)[number];

export type InquiryRecord = {
  id: string;
  clientName: string;
  clientEmail: string;
  phone: string | null;
  companyName: string | null;
  productType: string;
  message: string;
  status: string;
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
  createdAt: Date;
};

let inquiryPhoneColumnReady: Promise<void> | null = null;

export async function ensureInquiryPhoneColumn() {
  if (!inquiryPhoneColumnReady) {
    inquiryPhoneColumnReady = prisma
      .$executeRawUnsafe('ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "phone" TEXT')
      .then(() => undefined)
      .catch((error) => {
        inquiryPhoneColumnReady = null;
        throw error;
      });
  }

  await inquiryPhoneColumnReady;
}

export function isInquiryStatus(value: string | null | undefined): value is InquiryStatus {
  return inquiryStatuses.includes(value as InquiryStatus);
}

export async function createInquiryRecord(input: {
  clientName: string;
  clientEmail: string;
  phone?: string | null;
  companyName?: string | null;
  productType: string;
  message: string;
}) {
  await ensureInquiryPhoneColumn();

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
    randomUUID(),
    input.clientName,
    input.clientEmail,
    input.phone || null,
    input.companyName || null,
    input.productType,
    input.message
  );
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  await ensureInquiryPhoneColumn();

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
        "createdAt"
      FROM "Inquiry"
      ORDER BY "createdAt" DESC
    `
  );

  return rows;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await ensureInquiryPhoneColumn();

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
  await ensureInquiryPhoneColumn();

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
