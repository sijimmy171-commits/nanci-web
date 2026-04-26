import 'server-only';

import { prisma } from '@/lib/prisma';
import { createEmptyLocalizedField, getFallbackLocale, type LocalizedField } from '@/lib/site-content-overrides';
import { type Locale } from '@/lib/i18n';

type EditorialKind = 'case-study' | 'news-article';

export type EditorialTranslations = {
  title: LocalizedField;
  summary: LocalizedField;
  content: LocalizedField;
  region: LocalizedField;
  category: LocalizedField;
  product: LocalizedField;
};

export type EditorialBaseRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  region: string | null;
  product: string | null;
  coverImageUrl: string | null;
  tags: string[];
  published: boolean;
  publishedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalizedEditorialRecord = EditorialBaseRecord & {
  translations: EditorialTranslations;
};

function tableName(kind: EditorialKind) {
  return kind === 'case-study' ? '"CaseStudy"' : '"NewsArticle"';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeLocalizedField(value: unknown, fallback: LocalizedField): LocalizedField {
  if (!isObject(value)) return { ...fallback };

  return Object.keys(fallback).reduce((acc, localeKey) => {
    const locale = localeKey as Locale;
    acc[locale] = typeof value[locale] === 'string' ? value[locale] as string : fallback[locale];
    return acc;
  }, { ...fallback });
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function createEmptyEditorialTranslations(): EditorialTranslations {
  return {
    title: createEmptyLocalizedField(),
    summary: createEmptyLocalizedField(),
    content: createEmptyLocalizedField(),
    region: createEmptyLocalizedField(),
    category: createEmptyLocalizedField(),
    product: createEmptyLocalizedField(),
  };
}

export function normalizeEditorialTranslations(value: unknown): EditorialTranslations {
  const source = isObject(value) ? value : {};
  const defaults = createEmptyEditorialTranslations();

  return {
    title: mergeLocalizedField(source.title, defaults.title),
    summary: mergeLocalizedField(source.summary, defaults.summary),
    content: mergeLocalizedField(source.content, defaults.content),
    region: mergeLocalizedField(source.region, defaults.region),
    category: mergeLocalizedField(source.category, defaults.category),
    product: mergeLocalizedField(source.product, defaults.product),
  };
}

let editorialTablesReady: Promise<void> | null = null;

export function ensureEditorialTables() {
  editorialTablesReady ??= (async () => {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CaseStudy" (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        region TEXT,
        product TEXT,
        "coverImageUrl" TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        published BOOLEAN DEFAULT true,
        "publishedAt" TIMESTAMP(3),
        "sortOrder" INTEGER DEFAULT 0,
        "contentTranslations" JSONB,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsArticle" (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        region TEXT,
        product TEXT,
        "coverImageUrl" TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        published BOOLEAN DEFAULT true,
        "publishedAt" TIMESTAMP(3),
        "sortOrder" INTEGER DEFAULT 0,
        "contentTranslations" JSONB,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `);
  })().catch((error) => {
    editorialTablesReady = null;
    throw error;
  });

  return editorialTablesReady;
}

type EditorialRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  region: string | null;
  product: string | null;
  coverImageUrl: string | null;
  tags: unknown;
  published: boolean;
  publishedAt: Date | null;
  sortOrder: number | null;
  contentTranslations: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function mapEditorialRow(row: EditorialRow): LocalizedEditorialRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    region: row.region,
    product: row.product,
    coverImageUrl: row.coverImageUrl,
    tags: normalizeTags(row.tags),
    published: row.published,
    publishedAt: row.publishedAt,
    sortOrder: row.sortOrder ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: normalizeEditorialTranslations(row.contentTranslations),
  };
}

export async function listEditorialRecords(kind: EditorialKind, publishedOnly = false): Promise<LocalizedEditorialRecord[]> {
  await ensureEditorialTables();
  const publishedClause = publishedOnly ? 'WHERE published = true' : '';
  const rows = await prisma.$queryRawUnsafe<EditorialRow[]>(
    `SELECT id, slug, title, summary, content, category, region, product, "coverImageUrl" AS "coverImageUrl", tags, published, "publishedAt" AS "publishedAt", "sortOrder" AS "sortOrder", "contentTranslations" AS "contentTranslations", "createdAt" AS "createdAt", "updatedAt" AS "updatedAt" FROM ${tableName(kind)} ${publishedClause} ORDER BY COALESCE("publishedAt", "createdAt") DESC, "sortOrder" ASC`
  );
  return rows.map(mapEditorialRow);
}

export async function getEditorialRecordById(kind: EditorialKind, id: string): Promise<LocalizedEditorialRecord | null> {
  await ensureEditorialTables();
  const rows = await prisma.$queryRawUnsafe<EditorialRow[]>(
    `SELECT id, slug, title, summary, content, category, region, product, "coverImageUrl" AS "coverImageUrl", tags, published, "publishedAt" AS "publishedAt", "sortOrder" AS "sortOrder", "contentTranslations" AS "contentTranslations", "createdAt" AS "createdAt", "updatedAt" AS "updatedAt" FROM ${tableName(kind)} WHERE id = $1 LIMIT 1`,
    id
  );
  return rows[0] ? mapEditorialRow(rows[0]) : null;
}

export async function getEditorialRecordBySlug(kind: EditorialKind, slug: string): Promise<LocalizedEditorialRecord | null> {
  await ensureEditorialTables();
  const rows = await prisma.$queryRawUnsafe<EditorialRow[]>(
    `SELECT id, slug, title, summary, content, category, region, product, "coverImageUrl" AS "coverImageUrl", tags, published, "publishedAt" AS "publishedAt", "sortOrder" AS "sortOrder", "contentTranslations" AS "contentTranslations", "createdAt" AS "createdAt", "updatedAt" AS "updatedAt" FROM ${tableName(kind)} WHERE slug = $1 LIMIT 1`,
    slug
  );
  return rows[0] ? mapEditorialRow(rows[0]) : null;
}

export async function createEditorialRecord(kind: EditorialKind, input: Omit<EditorialBaseRecord, 'createdAt' | 'updatedAt'>, translations: EditorialTranslations) {
  await ensureEditorialTables();
  await prisma.$executeRawUnsafe(
    `INSERT INTO ${tableName(kind)} (id, slug, title, summary, content, category, region, product, "coverImageUrl", tags, published, "publishedAt", "sortOrder", "contentTranslations") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14::jsonb)`,
    input.id,
    input.slug,
    input.title,
    input.summary,
    input.content,
    input.category,
    input.region,
    input.product,
    input.coverImageUrl,
    JSON.stringify(input.tags),
    input.published,
    input.publishedAt,
    input.sortOrder,
    JSON.stringify(translations)
  );
}

export async function updateEditorialRecord(kind: EditorialKind, input: Omit<EditorialBaseRecord, 'createdAt' | 'updatedAt'>, translations: EditorialTranslations) {
  await ensureEditorialTables();
  await prisma.$executeRawUnsafe(
    `UPDATE ${tableName(kind)} SET slug = $1, title = $2, summary = $3, content = $4, category = $5, region = $6, product = $7, "coverImageUrl" = $8, tags = $9::jsonb, published = $10, "publishedAt" = $11, "sortOrder" = $12, "contentTranslations" = $13::jsonb, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $14`,
    input.slug,
    input.title,
    input.summary,
    input.content,
    input.category,
    input.region,
    input.product,
    input.coverImageUrl,
    JSON.stringify(input.tags),
    input.published,
    input.publishedAt,
    input.sortOrder,
    JSON.stringify(translations),
    input.id
  );
}

export async function deleteEditorialRecord(kind: EditorialKind, id: string) {
  await ensureEditorialTables();
  await prisma.$executeRawUnsafe(`DELETE FROM ${tableName(kind)} WHERE id = $1`, id);
}

function resolveLocalizedField(baseValue: string | null, field: LocalizedField, locale: Locale) {
  return field[locale] || field[getFallbackLocale(locale)] || (locale === 'zh' ? baseValue ?? '' : field.zh || baseValue || '');
}

export function localizeEditorialRecord(record: LocalizedEditorialRecord, locale: Locale): LocalizedEditorialRecord {
  return {
    ...record,
    title: resolveLocalizedField(record.title, record.translations.title, locale) || record.title,
    summary: resolveLocalizedField(record.summary, record.translations.summary, locale) || record.summary,
    content: resolveLocalizedField(record.content, record.translations.content, locale) || record.content,
    category: resolveLocalizedField(record.category, record.translations.category, locale) || record.category,
    region: resolveLocalizedField(record.region, record.translations.region, locale) || record.region,
    product: resolveLocalizedField(record.product, record.translations.product, locale) || record.product,
  };
}
