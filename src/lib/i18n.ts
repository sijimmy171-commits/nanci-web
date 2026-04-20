export const locales = ['en', 'zh', 'es', 'fr', 'ar', 'ru', 'de', 'id', 'vi'] as const;
export const publishedLocales = ['en', 'zh'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
export type PublishedLocale = (typeof publishedLocales)[number];

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  zh: 'Chinese',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
  ru: 'Russian',
  de: 'German',
  id: 'Indonesian',
  vi: 'Vietnamese',
};

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isPublishedLocale(value: string): value is PublishedLocale {
  return publishedLocales.includes(value as PublishedLocale);
}

export function getLocalizedPath(locale: string, path = '/') {
  const normalizedPath = path === '/' ? '' : path;
  return `/${locale}${normalizedPath}`;
}

export function removeLocaleFromPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const [first, ...rest] = segments;

  if (first && hasLocale(first)) {
    return rest.length === 0 ? '/' : `/${rest.join('/')}`;
  }

  return pathname || '/';
}

export function getLocaleDirection(locale: Locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
