import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getResolvedDictionary } from '@/lib/site-content';
import { getSiteConfig } from '@/lib/site-config';
import { getLocalizedPath, hasLocale, type Locale } from '@/lib/i18n';
import { getEditorialRecordBySlug, localizeEditorialRecord } from '@/lib/editorial';

export default async function LocalizedCaseDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const [record, config] = await Promise.all([getEditorialRecordBySlug('case-study', slug), getSiteConfig()]);
  if (!record || !record.published) notFound();

  const item = localizeEditorialRecord(record, locale);
  const dictionary = await getResolvedDictionary(locale, config);

  return (
    <div className="w-full bg-white text-bmw-darkgray min-h-screen pt-28 pb-20">
      <article className="max-w-5xl mx-auto px-4">
        <Link href={getLocalizedPath(locale, '/cases')} className="inline-flex items-center text-xs font-bold text-bmw-silver hover:text-bmw-black uppercase tracking-widest transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          {dictionary.cases.back}
        </Link>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bmw-blue">
            <span>{item.category}</span>
            {item.region && <span>{item.region}</span>}
            {item.publishedAt && <span>{new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US').format(item.publishedAt)}</span>}
          </div>

          <h1 className="text-4xl md:text-5xl font-light text-bmw-black">{item.title}</h1>
          <p className="text-xl text-gray-500 leading-8">{item.summary}</p>

          {item.coverImageUrl && (
            <div className="overflow-hidden border border-gray-200 bg-bmw-lightgray">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.coverImageUrl} alt={item.title} className="w-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-gray-200">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-bmw-silver mb-2">{dictionary.cases.categoryLabel}</p>
              <p className="text-bmw-black">{item.category}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-bmw-silver mb-2">{dictionary.cases.regionLabel}</p>
              <p className="text-bmw-black">{item.region || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-bmw-silver mb-2">{dictionary.cases.productLabel}</p>
              <p className="text-bmw-black">{item.product || '-'}</p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none prose-p:leading-8 prose-p:text-gray-700 whitespace-pre-wrap">
            {item.content}
          </div>
        </div>
      </article>
    </div>
  );
}
