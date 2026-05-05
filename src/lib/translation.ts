import 'server-only';

import { locales, localeLabels, type Locale } from '@/lib/i18n';
import { type LocalizedField, type SiteContentOverrides } from '@/lib/site-content-overrides';

type TranslatableEntry = {
  path: string;
  zh: string;
  en: string;
};

type TranslationResponse = Record<string, Partial<Record<Locale, string>>>;

const AUTO_TRANSLATED_LOCALES = locales.filter((locale) => locale !== 'zh');
type TranslationPayloadEntry = {
  path: string;
  zh: string;
  en: string;
};

function collectEntries(overrides: SiteContentOverrides): TranslatableEntry[] {
  return [
    { path: 'home.heroSlides.0.title', zh: overrides.home.heroSlides[0].title.zh, en: overrides.home.heroSlides[0].title.en },
    { path: 'home.heroSlides.0.subtitle', zh: overrides.home.heroSlides[0].subtitle.zh, en: overrides.home.heroSlides[0].subtitle.en },
    { path: 'home.heroSlides.1.title', zh: overrides.home.heroSlides[1].title.zh, en: overrides.home.heroSlides[1].title.en },
    { path: 'home.heroSlides.1.subtitle', zh: overrides.home.heroSlides[1].subtitle.zh, en: overrides.home.heroSlides[1].subtitle.en },
    { path: 'footer.brandDescription', zh: overrides.footer.brandDescription.zh, en: overrides.footer.brandDescription.en },
    { path: 'products.title', zh: overrides.products.title.zh, en: overrides.products.title.en },
    { path: 'products.description', zh: overrides.products.description.zh, en: overrides.products.description.en },
    { path: 'products.supportTitle', zh: overrides.products.supportTitle.zh, en: overrides.products.supportTitle.en },
    { path: 'products.supportCta', zh: overrides.products.supportCta.zh, en: overrides.products.supportCta.en },
    { path: 'products.detailQuoteCta', zh: overrides.products.detailQuoteCta.zh, en: overrides.products.detailQuoteCta.en },
    { path: 'products.detailPdfCta', zh: overrides.products.detailPdfCta.zh, en: overrides.products.detailPdfCta.en },
    { path: 'contact.title', zh: overrides.contact.title.zh, en: overrides.contact.title.en },
    { path: 'contact.description', zh: overrides.contact.description.zh, en: overrides.contact.description.en },
    { path: 'contact.formTitle', zh: overrides.contact.formTitle.zh, en: overrides.contact.formTitle.en },
    { path: 'contact.whatsappTitle', zh: overrides.contact.whatsappTitle.zh, en: overrides.contact.whatsappTitle.en },
    { path: 'contact.hqAddress', zh: overrides.contact.hqAddress.zh, en: overrides.contact.hqAddress.en },
    { path: 'contact.formMessagePlaceholder', zh: overrides.contact.formMessagePlaceholder.zh, en: overrides.contact.formMessagePlaceholder.en },
  ].filter((entry) => entry.zh || entry.en);
}

function mergeField(field: LocalizedField, translated: Partial<Record<Locale, string>> | undefined): LocalizedField {
  if (!translated) return field;

  const next = { ...field };
  for (const locale of AUTO_TRANSLATED_LOCALES) {
    const value = translated[locale]?.trim();
    if (value) next[locale] = value;
  }
  return next;
}

function mergeTranslations(overrides: SiteContentOverrides, translated: TranslationResponse): SiteContentOverrides {
  return {
    home: {
      heroSlides: [
        {
          title: mergeField(overrides.home.heroSlides[0].title, translated['home.heroSlides.0.title']),
          subtitle: mergeField(overrides.home.heroSlides[0].subtitle, translated['home.heroSlides.0.subtitle']),
        },
        {
          title: mergeField(overrides.home.heroSlides[1].title, translated['home.heroSlides.1.title']),
          subtitle: mergeField(overrides.home.heroSlides[1].subtitle, translated['home.heroSlides.1.subtitle']),
        },
      ],
    },
    footer: {
      brandDescription: mergeField(overrides.footer.brandDescription, translated['footer.brandDescription']),
    },
    products: {
      title: mergeField(overrides.products.title, translated['products.title']),
      description: mergeField(overrides.products.description, translated['products.description']),
      supportTitle: mergeField(overrides.products.supportTitle, translated['products.supportTitle']),
      supportCta: mergeField(overrides.products.supportCta, translated['products.supportCta']),
      detailQuoteCta: mergeField(overrides.products.detailQuoteCta, translated['products.detailQuoteCta']),
      detailPdfCta: mergeField(overrides.products.detailPdfCta, translated['products.detailPdfCta']),
    },
    contact: {
      title: mergeField(overrides.contact.title, translated['contact.title']),
      description: mergeField(overrides.contact.description, translated['contact.description']),
      formTitle: mergeField(overrides.contact.formTitle, translated['contact.formTitle']),
      whatsappTitle: mergeField(overrides.contact.whatsappTitle, translated['contact.whatsappTitle']),
      hqAddress: mergeField(overrides.contact.hqAddress, translated['contact.hqAddress']),
      formMessagePlaceholder: mergeField(overrides.contact.formMessagePlaceholder, translated['contact.formMessagePlaceholder']),
    },
  };
}

export function isAutoTranslationConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

async function requestLocaleTranslations(entries: TranslationPayloadEntry[], task: string) {
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4.1-mini';

  const targetLocales = AUTO_TRANSLATED_LOCALES.map((locale) => ({
    code: locale,
    label: localeLabels[locale],
  }));

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a professional B2B industrial website localization editor. Return JSON only. Preserve brand names, model numbers, company names, URLs, phone numbers, and technical abbreviations unless translation is obvious and safe.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            task,
            rules: [
              'Return a JSON object keyed by the provided path.',
              'Each path must map to an object keyed by locale code.',
              'Do not include explanations or markdown.',
              'If the English reference is already high quality, you may adapt from it while staying faithful to the Chinese source.',
            ],
            targetLocales,
            entries,
          }),
        },
      ],
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translation request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json() as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Translation response was empty.');
  }

  return JSON.parse(content) as TranslationResponse;
}

export async function autoTranslateOverrides(overrides: SiteContentOverrides) {
  if (!isAutoTranslationConfigured()) {
    return {
      overrides,
      translated: false,
      message: 'OPENAI_API_KEY is not configured. Saved current Chinese and English only.',
    };
  }

  const entries = collectEntries(overrides);
  if (entries.length === 0) {
    return {
      overrides,
      translated: false,
      message: 'No translatable content fields were provided.',
    };
  }

  const translated = await requestLocaleTranslations(
    entries,
    'Translate the following website copy into each target locale. Use simplified, natural, sales-ready wording suitable for a global industrial equipment website.'
  );

  return {
    overrides: mergeTranslations(overrides, translated),
    translated: true,
    message: `Auto-generated ${AUTO_TRANSLATED_LOCALES.length} locale variants.`,
  };
}

export async function autoTranslateLocalizedFields(
  fields: TranslationPayloadEntry[],
  task = 'Translate the following product copy into each target locale. Keep technical wording clear and commercially natural for a global industrial equipment website.'
) {
  if (!isAutoTranslationConfigured()) {
    return {
      translations: null,
      translated: false,
      message: 'OPENAI_API_KEY is not configured. Saved current Chinese and English only.',
    };
  }

  if (fields.length === 0) {
    return {
      translations: null,
      translated: false,
      message: 'No translatable content fields were provided.',
    };
  }

  return {
    translations: await requestLocaleTranslations(fields, task),
    translated: true,
    message: `Auto-generated ${AUTO_TRANSLATED_LOCALES.length} locale variants.`,
  };
}
