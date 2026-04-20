import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getResolvedDictionary } from '@/lib/site-content';
import { getSiteConfig } from '@/lib/site-config';
import { getLocalizedPath, hasLocale, type Locale } from '@/lib/i18n';
import { listEditorialRecords, localizeEditorialRecord } from '@/lib/editorial';

export default async function LocalizedNewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const [records, config] = await Promise.all([listEditorialRecords('news-article', true), getSiteConfig()]);
  const dictionary = await getResolvedDictionary(locale, config);
  const articles = records.map((record) => localizeEditorialRecord(record, locale));
  const formatter = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="w-full bg-white text-bmw-darkgray min-h-screen">
      <section className="bg-bmw-black text-white pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-bmw-blue text-xs font-bold tracking-[0.3em] uppercase mb-4">{dictionary.news.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-6">{dictionary.news.title}</h1>
          <p className="text-bmw-silver font-light max-w-3xl text-lg">{dictionary.news.description}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        {articles.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500">
            {dictionary.news.emptyState}
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((item) => (
              <article key={item.id} className="border border-gray-200 p-8 md:p-10 bg-white">
                <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-bmw-blue mb-4">
                  <span>{item.category}</span>
                  {item.publishedAt && <span>{formatter.format(item.publishedAt)}</span>}
                </div>
                <h2 className="text-3xl font-light text-bmw-black mb-4">{item.title}</h2>
                <p className="text-gray-600 leading-8 mb-6">{item.summary}</p>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 border border-gray-200 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link href={getLocalizedPath(locale, `/news/${item.slug}`)} className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-bmw-black hover:text-bmw-blue transition-colors">
                  {dictionary.news.readMore}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
