import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getResolvedDictionary } from '@/lib/site-content';
import { getSiteConfig } from '@/lib/site-config';
import { getLocalizedPath, hasLocale, type Locale } from '@/lib/i18n';
import { listEditorialRecords, localizeEditorialRecord } from '@/lib/editorial';

export default async function LocalizedCasesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const [records, config] = await Promise.all([listEditorialRecords('case-study', true), getSiteConfig()]);
  const dictionary = await getResolvedDictionary(locale, config);
  const cases = records.map((record) => localizeEditorialRecord(record, locale));

  return (
    <div className="w-full bg-white text-bmw-darkgray min-h-screen">
      <section className="bg-bmw-black text-white pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-bmw-blue text-xs font-bold tracking-[0.3em] uppercase mb-4">{dictionary.cases.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-6">{dictionary.cases.title}</h1>
          <p className="text-bmw-silver font-light max-w-3xl text-lg">{dictionary.cases.description}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        {cases.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500">
            {dictionary.cases.emptyState}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cases.map((item) => (
              <article key={item.id} className="border border-gray-200 bg-white overflow-hidden group">
                <div className="aspect-[16/9] bg-bmw-lightgray relative overflow-hidden">
                  {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverImageUrl} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-bmw-silver text-sm tracking-[0.3em] uppercase">
                      SUCI CASE
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bmw-blue">
                    <span>{item.category}</span>
                    {item.region && <span>{item.region}</span>}
                  </div>
                  <h2 className="text-2xl font-semibold text-bmw-black">{item.title}</h2>
                  <p className="text-gray-600 leading-7">{item.summary}</p>
                  {item.product && <p className="text-sm text-gray-500">{dictionary.cases.productLabel}: {item.product}</p>}
                  <Link href={getLocalizedPath(locale, `/cases/${item.slug}`)} className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-bmw-black hover:text-bmw-blue transition-colors">
                    {dictionary.cases.readMore}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
