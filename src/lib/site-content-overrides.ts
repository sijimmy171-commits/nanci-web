import { Prisma } from '@prisma/client';
import { withDatabaseRetry } from '@/lib/db-retry';
import { prisma } from '@/lib/prisma';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';

export type LocalizedField = Record<Locale, string>;

export type SiteContentOverrides = {
  home: {
    heroSlides: Array<{
      title: LocalizedField;
      subtitle: LocalizedField;
    }>;
  };
  footer: {
    brandDescription: LocalizedField;
  };
  products: {
    title: LocalizedField;
    description: LocalizedField;
    supportTitle: LocalizedField;
    supportCta: LocalizedField;
    detailQuoteCta: LocalizedField;
    detailPdfCta: LocalizedField;
  };
  contact: {
    title: LocalizedField;
    description: LocalizedField;
    formTitle: LocalizedField;
    whatsappTitle: LocalizedField;
    hqAddress: LocalizedField;
    formMessagePlaceholder: LocalizedField;
  };
};

export function createEmptyLocalizedField(): LocalizedField {
  return locales.reduce((acc, locale) => {
    acc[locale] = '';
    return acc;
  }, {} as LocalizedField);
}

export const defaultSiteContentOverrides: SiteContentOverrides = {
  home: {
    heroSlides: [
      {
        title: createEmptyLocalizedField(),
        subtitle: createEmptyLocalizedField(),
      },
      {
        title: createEmptyLocalizedField(),
        subtitle: createEmptyLocalizedField(),
      },
    ],
  },
  footer: {
    brandDescription: createEmptyLocalizedField(),
  },
  products: {
    title: createEmptyLocalizedField(),
    description: createEmptyLocalizedField(),
    supportTitle: createEmptyLocalizedField(),
    supportCta: createEmptyLocalizedField(),
    detailQuoteCta: createEmptyLocalizedField(),
    detailPdfCta: createEmptyLocalizedField(),
  },
  contact: {
    title: createEmptyLocalizedField(),
    description: createEmptyLocalizedField(),
    formTitle: createEmptyLocalizedField(),
    whatsappTitle: createEmptyLocalizedField(),
    hqAddress: createEmptyLocalizedField(),
    formMessagePlaceholder: createEmptyLocalizedField(),
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeLocalizedField(value: unknown, fallback: LocalizedField): LocalizedField {
  if (!isObject(value)) return { ...fallback };

  return locales.reduce((acc, locale) => {
    acc[locale] = typeof value[locale] === 'string' ? value[locale] as string : fallback[locale];
    return acc;
  }, createEmptyLocalizedField());
}

export function normalizeSiteContentOverrides(value: unknown): SiteContentOverrides {
  const source = isObject(value) ? value : {};
  const home = isObject(source.home) ? source.home : {};
  const heroSlides = Array.isArray(home.heroSlides) ? home.heroSlides : [];
  const footer = isObject(source.footer) ? source.footer : {};
  const products = isObject(source.products) ? source.products : {};
  const contact = isObject(source.contact) ? source.contact : {};

  return {
    home: {
      heroSlides: defaultSiteContentOverrides.home.heroSlides.map((fallback, index) => {
        const slide = isObject(heroSlides[index]) ? heroSlides[index] : {};

        return {
          title: mergeLocalizedField(slide.title, fallback.title),
          subtitle: mergeLocalizedField(slide.subtitle, fallback.subtitle),
        };
      }),
    },
    footer: {
      brandDescription: mergeLocalizedField(footer.brandDescription, defaultSiteContentOverrides.footer.brandDescription),
    },
    products: {
      title: mergeLocalizedField(products.title, defaultSiteContentOverrides.products.title),
      description: mergeLocalizedField(products.description, defaultSiteContentOverrides.products.description),
      supportTitle: mergeLocalizedField(products.supportTitle, defaultSiteContentOverrides.products.supportTitle),
      supportCta: mergeLocalizedField(products.supportCta, defaultSiteContentOverrides.products.supportCta),
      detailQuoteCta: mergeLocalizedField(products.detailQuoteCta, defaultSiteContentOverrides.products.detailQuoteCta),
      detailPdfCta: mergeLocalizedField(products.detailPdfCta, defaultSiteContentOverrides.products.detailPdfCta),
    },
    contact: {
      title: mergeLocalizedField(contact.title, defaultSiteContentOverrides.contact.title),
      description: mergeLocalizedField(contact.description, defaultSiteContentOverrides.contact.description),
      formTitle: mergeLocalizedField(contact.formTitle, defaultSiteContentOverrides.contact.formTitle),
      whatsappTitle: mergeLocalizedField(contact.whatsappTitle, defaultSiteContentOverrides.contact.whatsappTitle),
      hqAddress: mergeLocalizedField(contact.hqAddress, defaultSiteContentOverrides.contact.hqAddress),
      formMessagePlaceholder: mergeLocalizedField(contact.formMessagePlaceholder, defaultSiteContentOverrides.contact.formMessagePlaceholder),
    },
  };
}

export function resolveTranslatedField(field: LocalizedField, locale: Locale) {
  return field[locale] || field[getFallbackLocale(locale)] || field.zh || '';
}

type ContentRow = {
  contentOverrides: Prisma.JsonValue | null;
};

let siteContentOverridesColumnReady: Promise<void> | null = null;

function ensureSiteContentOverridesColumn() {
  siteContentOverridesColumnReady ??= withDatabaseRetry(() =>
    prisma.$executeRawUnsafe('ALTER TABLE "SiteConfig" ADD COLUMN IF NOT EXISTS "contentOverrides" JSONB')
  )
    .then(() => undefined)
    .catch((error) => {
      siteContentOverridesColumnReady = null;
      throw error;
    });

  return siteContentOverridesColumnReady;
}

export async function getSiteContentOverrides(): Promise<SiteContentOverrides> {
  await ensureSiteContentOverridesColumn();

  const rows = await withDatabaseRetry(() =>
    prisma.$queryRawUnsafe<ContentRow[]>(
      'SELECT "contentOverrides" FROM "SiteConfig" WHERE id = $1 LIMIT 1',
      'default'
    )
  );

  return normalizeSiteContentOverrides(rows[0]?.contentOverrides ?? null);
}

export async function saveSiteContentOverrides(overrides: SiteContentOverrides) {
  await ensureSiteContentOverridesColumn();

  await withDatabaseRetry(() =>
    prisma.$executeRawUnsafe(
      'UPDATE "SiteConfig" SET "contentOverrides" = $1::jsonb WHERE id = $2',
      JSON.stringify(overrides),
      'default'
    )
  );
}

export function getFallbackLocale(locale: string): Locale {
  if (locale === 'zh') return 'zh';
  return defaultLocale;
}
