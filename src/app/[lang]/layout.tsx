import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HtmlLangSetter } from '@/components/HtmlLangSetter';
import { getSiteConfig } from '@/lib/site-config';
import { getResolvedDictionary } from '@/lib/site-content';
import { getLocaleDirection, hasLocale, locales, type Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    return {};
  }

  const locale = lang as Locale;
  const config = await getSiteConfig();
  const dict = await getResolvedDictionary(locale, config);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const dir = getLocaleDirection(locale);
  const config = await getSiteConfig();
  const dictionary = await getResolvedDictionary(locale, config);

  return (
    <div lang={locale} dir={dir}>
      <HtmlLangSetter lang={locale} dir={dir === 'rtl' ? 'rtl' : undefined} />
      <Header locale={locale} dictionary={dictionary} />
      <main className="min-h-screen">{children}</main>
      <Footer locale={locale} dictionary={dictionary} config={config} />
    </div>
  );
}
