import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocalizedProducts } from '@/lib/product-content';
import { listProductDocuments, localizeProductDocument } from '@/lib/product-documents';
import { getSiteConfig } from '@/lib/site-config';
import ProductList from '../../products/ProductList';
import ProductDocumentsSection from '../../products/ProductDocumentsSection';
import { getResolvedDictionary } from '@/lib/site-content';
import { getLocalizedPath, hasLocale, type Locale } from '@/lib/i18n';
import { isProductCategoryKey, type ProductCategoryKey } from '@/lib/product-taxonomy';

type SearchParams = Promise<{
  category?: string | string[] | undefined;
}>;

export default async function LocalizedProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParams;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const query = await searchParams;
  const category = Array.isArray(query.category) ? query.category[0] : query.category;
  const initialCategory: ProductCategoryKey | null = isProductCategoryKey(category) ? category : null;

  const config = await getSiteConfig();
  const dictionary = await getResolvedDictionary(locale, config);
  const [products, documents] = await Promise.all([
    getLocalizedProducts(locale),
    listProductDocuments(true),
  ]);
  const localizedDocuments = documents.map((document) => localizeProductDocument(document, locale));

  return (
    <div className="w-full bg-white text-gray-900 min-h-screen">
      <div className="bg-bmw-black text-white pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm font-bold text-bmw-blue tracking-[0.3em] uppercase mb-4">{dictionary.products.eyebrow}</h1>
          <h2 className="text-4xl md:text-6xl font-light tracking-wide mb-6 text-white">{dictionary.products.title}</h2>
          <p className="text-bmw-silver font-light max-w-2xl text-lg">{dictionary.products.description}</p>
        </div>
      </div>

      <div id="product-categories" className="scroll-mt-32">
        <ProductList
          initialProducts={products}
          locale={locale}
          dictionary={dictionary}
          initialCategory={initialCategory}
        />
      </div>

      <ProductDocumentsSection documents={localizedDocuments} copy={dictionary.products.documents} />

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="rounded-3xl bg-bmw-black text-white p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-bmw-blue text-xs font-bold tracking-[0.3em] uppercase mb-3">{dictionary.products.supportEyebrow}</p>
            <h3 className="text-3xl font-light">{dictionary.products.supportTitle}</h3>
          </div>
          <Link href={getLocalizedPath(locale, '/contact')} className="inline-flex items-center justify-center bg-white text-bmw-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-bmw-lightgray transition-colors">
            {dictionary.products.supportCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
