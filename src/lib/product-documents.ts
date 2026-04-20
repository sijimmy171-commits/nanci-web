import 'server-only';

import { prisma } from '@/lib/prisma';
import { createEmptyLocalizedField, getFallbackLocale, type LocalizedField } from '@/lib/site-content-overrides';
import { type Locale } from '@/lib/i18n';

export type ProductDocumentTranslations = {
  title: LocalizedField;
  summary: LocalizedField;
};

export type ProductDocumentRecord = {
  id: string;
  title: string;
  summary: string;
  fileUrl: string;
  sortOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalizedProductDocumentRecord = ProductDocumentRecord & {
  translations: ProductDocumentTranslations;
};

type ProductDocumentRow = {
  id: string;
  title: string;
  summary: string;
  fileUrl: string;
  sortOrder: number | null;
  published: boolean;
  translations: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeLocalizedField(value: unknown, fallback: LocalizedField): LocalizedField {
  if (!isObject(value)) return { ...fallback };

  const next = { ...fallback };
  for (const locale of Object.keys(next) as Locale[]) {
    if (typeof value[locale] === 'string') {
      next[locale] = value[locale] as string;
    }
  }
  return next;
}

export function createEmptyProductDocumentTranslations(): ProductDocumentTranslations {
  return {
    title: createEmptyLocalizedField(),
    summary: createEmptyLocalizedField(),
  };
}

export function normalizeProductDocumentTranslations(value: unknown): ProductDocumentTranslations {
  const source = isObject(value) ? value : {};
  const defaults = createEmptyProductDocumentTranslations();

  return {
    title: mergeLocalizedField(source.title, defaults.title),
    summary: mergeLocalizedField(source.summary, defaults.summary),
  };
}

export async function ensureProductDocumentsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductDocument" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "sortOrder" INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      translations JSONB,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function mapRow(row: ProductDocumentRow): LocalizedProductDocumentRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    fileUrl: row.fileUrl,
    sortOrder: row.sortOrder ?? 0,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: normalizeProductDocumentTranslations(row.translations),
  };
}

export async function listProductDocuments(publishedOnly = false): Promise<LocalizedProductDocumentRecord[]> {
  await ensureProductDocumentsTable();
  const whereClause = publishedOnly ? 'WHERE published = true' : '';
  const rows = await prisma.$queryRawUnsafe<ProductDocumentRow[]>(
    `SELECT id, title, summary, "fileUrl" AS "fileUrl", "sortOrder" AS "sortOrder", published, translations, "createdAt" AS "createdAt", "updatedAt" AS "updatedAt" FROM "ProductDocument" ${whereClause} ORDER BY "sortOrder" ASC, "createdAt" DESC`
  );
  return rows.map(mapRow);
}

export async function getProductDocumentById(id: string): Promise<LocalizedProductDocumentRecord | null> {
  await ensureProductDocumentsTable();
  const rows = await prisma.$queryRawUnsafe<ProductDocumentRow[]>(
    `SELECT id, title, summary, "fileUrl" AS "fileUrl", "sortOrder" AS "sortOrder", published, translations, "createdAt" AS "createdAt", "updatedAt" AS "updatedAt" FROM "ProductDocument" WHERE id = $1 LIMIT 1`,
    id
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createProductDocument(
  input: Omit<ProductDocumentRecord, 'createdAt' | 'updatedAt'>,
  translations: ProductDocumentTranslations
) {
  await ensureProductDocumentsTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ProductDocument" (id, title, summary, "fileUrl", "sortOrder", published, translations) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    input.id,
    input.title,
    input.summary,
    input.fileUrl,
    input.sortOrder,
    input.published,
    JSON.stringify(translations)
  );
}

export async function updateProductDocument(
  input: Omit<ProductDocumentRecord, 'createdAt' | 'updatedAt'>,
  translations: ProductDocumentTranslations
) {
  await ensureProductDocumentsTable();
  await prisma.$executeRawUnsafe(
    `UPDATE "ProductDocument" SET title = $1, summary = $2, "fileUrl" = $3, "sortOrder" = $4, published = $5, translations = $6::jsonb, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $7`,
    input.title,
    input.summary,
    input.fileUrl,
    input.sortOrder,
    input.published,
    JSON.stringify(translations),
    input.id
  );
}

export async function deleteProductDocument(id: string) {
  await ensureProductDocumentsTable();
  await prisma.$executeRawUnsafe(`DELETE FROM "ProductDocument" WHERE id = $1`, id);
}

function resolveLocalizedField(baseValue: string, field: LocalizedField, locale: Locale) {
  return field[locale] || field[getFallbackLocale(locale)] || (locale === 'zh' ? baseValue : field.zh || baseValue);
}

export function localizeProductDocument(record: LocalizedProductDocumentRecord, locale: Locale): LocalizedProductDocumentRecord {
  return {
    ...record,
    title: resolveLocalizedField(record.title, record.translations.title, locale),
    summary: resolveLocalizedField(record.summary, record.translations.summary, locale),
  };
}
