import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { type Locale } from '@/lib/i18n';
import { createEmptyLocalizedField, getFallbackLocale, type LocalizedField } from '@/lib/site-content-overrides';
import {
  getDisplayCategoryLabel,
  getLegacyCategoryFallback,
  getPrimaryCategoryLabel,
  isPrimaryCategoryKey,
  isSecondaryCategoryKey,
  isTertiaryCategoryKey,
  type ProductPrimaryCategoryKey,
  type ProductSecondaryCategoryKey,
  type ProductTertiaryCategoryKey,
} from '@/lib/product-taxonomy';

export type ProductTranslations = {
  name: LocalizedField;
  description: LocalizedField;
  specs: LocalizedField;
};

export type ProductRecord = {
  id: string;
  name: string;
  model: string;
  category: string;
  categoryStatus: 'structured' | 'legacy' | 'unmapped';
  primaryCategory: ProductPrimaryCategoryKey | null;
  secondaryCategory: ProductSecondaryCategoryKey | null;
  tertiaryCategory: ProductTertiaryCategoryKey | null;
  description: string | null;
  specs: string | null;
  imageUrl: string | null;
  catalogUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalizedProductRecord = ProductRecord & {
  translations: ProductTranslations;
};

type ProductTranslationRow = {
  id: string;
  contentTranslations: Prisma.JsonValue | null;
};

type ProductRow = ProductRecord & {
  contentTranslations: Prisma.JsonValue | null;
};

export function createEmptyProductTranslations(): ProductTranslations {
  return {
    name: createEmptyLocalizedField(),
    description: createEmptyLocalizedField(),
    specs: createEmptyLocalizedField(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeLocalizedField(value: unknown, fallback: LocalizedField): LocalizedField {
  if (!isObject(value)) return { ...fallback };

  const next = { ...fallback };
  for (const key of Object.keys(next) as Locale[]) {
    if (typeof value[key] === 'string') {
      next[key] = value[key] as string;
    }
  }
  return next;
}

export function normalizeProductTranslations(value: unknown): ProductTranslations {
  const source = isObject(value) ? value : {};
  return {
    name: mergeLocalizedField(source.name, createEmptyProductTranslations().name),
    description: mergeLocalizedField(source.description, createEmptyProductTranslations().description),
    specs: mergeLocalizedField(source.specs, createEmptyProductTranslations().specs),
  };
}

let productColumnsReady: Promise<void> | null = null;

export function ensureProductColumns() {
  productColumnsReady ??= (async () => {
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "contentTranslations" JSONB');
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT');
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "secondaryCategory" TEXT');
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tertiaryCategory" TEXT');
  })().catch((error) => {
    productColumnsReady = null;
    throw error;
  });

  return productColumnsReady;
}

function normalizeCategoryFields(row: {
  category: string;
  primaryCategory: string | null;
  secondaryCategory: string | null;
  tertiaryCategory: string | null;
}): Pick<ProductRecord, 'categoryStatus' | 'primaryCategory' | 'secondaryCategory' | 'tertiaryCategory'> {
  const fallback = getLegacyCategoryFallback(row.category);
  const hasStructuredPrimary = isPrimaryCategoryKey(row.primaryCategory);
  const hasStructuredSecondary = isSecondaryCategoryKey(row.secondaryCategory);
  const hasStructuredTertiary = !row.tertiaryCategory || isTertiaryCategoryKey(row.tertiaryCategory);
  const categoryStatus: ProductRecord['categoryStatus'] = hasStructuredPrimary && hasStructuredSecondary && hasStructuredTertiary
    ? 'structured'
    : fallback.primaryCategory
      ? 'legacy'
      : 'unmapped';

  return {
    categoryStatus,
    primaryCategory: hasStructuredPrimary ? (row.primaryCategory as ProductPrimaryCategoryKey) : fallback.primaryCategory,
    secondaryCategory: hasStructuredSecondary ? (row.secondaryCategory as ProductSecondaryCategoryKey) : fallback.secondaryCategory,
    tertiaryCategory: isTertiaryCategoryKey(row.tertiaryCategory) ? row.tertiaryCategory : fallback.tertiaryCategory,
  };
}

function normalizeProductRow(row: ProductRow): ProductRecord {
  const categories = normalizeCategoryFields(row);
  return {
    id: row.id,
    name: row.name,
    model: row.model,
    ...categories,
    category: row.category || getDisplayCategoryLabel(categories, 'zh') || getPrimaryCategoryLabel(categories.primaryCategory, 'zh'),
    description: row.description,
    specs: row.specs,
    imageUrl: row.imageUrl,
    catalogUrl: row.catalogUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function buildLegacyCategoryValue(categories: {
  primaryCategory: ProductPrimaryCategoryKey | null;
  secondaryCategory: ProductSecondaryCategoryKey | null;
  tertiaryCategory: ProductTertiaryCategoryKey | null;
}) {
  return getDisplayCategoryLabel(categories, 'zh') || getPrimaryCategoryLabel(categories.primaryCategory, 'zh') || '';
}

export async function saveProductCategoryFields(
  productId: string,
  categories: {
    primaryCategory: ProductPrimaryCategoryKey | null;
    secondaryCategory: ProductSecondaryCategoryKey | null;
    tertiaryCategory: ProductTertiaryCategoryKey | null;
  }
) {
  await ensureProductColumns();
  await prisma.$executeRawUnsafe(
    'UPDATE "Product" SET "primaryCategory" = $1, "secondaryCategory" = $2, "tertiaryCategory" = $3 WHERE id = $4',
    categories.primaryCategory,
    categories.secondaryCategory,
    categories.tertiaryCategory,
    productId
  );
}

export async function listProducts(): Promise<ProductRecord[]> {
  await ensureProductColumns();
  const rows = await prisma.$queryRawUnsafe<ProductRow[]>(
    'SELECT id, name, model, category, "primaryCategory" AS "primaryCategory", "secondaryCategory" AS "secondaryCategory", "tertiaryCategory" AS "tertiaryCategory", description, specs, "imageUrl" AS "imageUrl", "catalogUrl" AS "catalogUrl", "createdAt" AS "createdAt", "updatedAt" AS "updatedAt", "contentTranslations" AS "contentTranslations" FROM "Product" ORDER BY "createdAt" DESC'
  );

  return rows.map((row) => normalizeProductRow(row));
}

export async function getProductById(id: string): Promise<ProductRecord | null> {
  await ensureProductColumns();
  const rows = await prisma.$queryRawUnsafe<ProductRow[]>(
    'SELECT id, name, model, category, "primaryCategory" AS "primaryCategory", "secondaryCategory" AS "secondaryCategory", "tertiaryCategory" AS "tertiaryCategory", description, specs, "imageUrl" AS "imageUrl", "catalogUrl" AS "catalogUrl", "createdAt" AS "createdAt", "updatedAt" AS "updatedAt", "contentTranslations" AS "contentTranslations" FROM "Product" WHERE id = $1 LIMIT 1',
    id
  );

  const product = rows[0];
  if (!product) return null;
  return normalizeProductRow(product);
}

export async function getProductTranslationsMap(): Promise<Map<string, ProductTranslations>> {
  await ensureProductColumns();
  const rows = await prisma.$queryRawUnsafe<ProductTranslationRow[]>(
    'SELECT id, "contentTranslations" FROM "Product"'
  );

  return new Map(
    rows.map((row) => [row.id, normalizeProductTranslations(row.contentTranslations)])
  );
}

export async function getProductTranslations(productId: string): Promise<ProductTranslations> {
  await ensureProductColumns();
  const rows = await prisma.$queryRawUnsafe<ProductTranslationRow[]>(
    'SELECT id, "contentTranslations" FROM "Product" WHERE id = $1 LIMIT 1',
    productId
  );

  return normalizeProductTranslations(rows[0]?.contentTranslations ?? null);
}

export async function saveProductTranslations(productId: string, translations: ProductTranslations) {
  await ensureProductColumns();
  await prisma.$executeRawUnsafe(
    'UPDATE "Product" SET "contentTranslations" = $1::jsonb WHERE id = $2',
    JSON.stringify(translations),
    productId
  );
}

function resolveLocalizedField(baseValue: string | null, field: LocalizedField, locale: Locale) {
  return field[locale] || field[getFallbackLocale(locale)] || (locale === 'zh' ? baseValue ?? '' : field.zh || baseValue || '');
}

export function localizeProduct(product: ProductRecord, translations: ProductTranslations, locale: Locale): LocalizedProductRecord {
  return {
    ...product,
    name: resolveLocalizedField(product.name, translations.name, locale) || product.name,
    description: resolveLocalizedField(product.description, translations.description, locale) || product.description,
    specs: resolveLocalizedField(product.specs, translations.specs, locale) || product.specs,
    translations,
  };
}

export async function getLocalizedProducts(locale: Locale): Promise<LocalizedProductRecord[]> {
  const [products, translationsMap] = await Promise.all([
    listProducts(),
    getProductTranslationsMap(),
  ]);

  return products.map((product) =>
    localizeProduct(product, translationsMap.get(product.id) ?? createEmptyProductTranslations(), locale)
  );
}

export async function getLocalizedProductById(id: string, locale: Locale): Promise<LocalizedProductRecord | null> {
  const product = await getProductById(id);
  if (!product) return null;

  const translations = await getProductTranslations(id);
  return localizeProduct(product, translations, locale);
}
