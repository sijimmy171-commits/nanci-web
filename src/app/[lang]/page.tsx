import React from 'react';
import { notFound } from 'next/navigation';
import { getLocalizedProducts } from '@/lib/product-content';
import { getSiteConfig } from '@/lib/site-config';
import HomeClient from '../HomeClient';
import { getResolvedDictionary } from '@/lib/site-content';
import { hasLocale, type Locale } from '@/lib/i18n';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const config = await getSiteConfig();
  const [dictionary, products] = await Promise.all([getResolvedDictionary(locale, config), getLocalizedProducts(locale)]);

  return (
    <HomeClient
      locale={locale}
      dictionary={dictionary}
      products={products.slice(0, 3).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
      }))}
    />
  );
}
