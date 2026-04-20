import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getResolvedDictionary } from '@/lib/site-content';
import { getSiteConfig } from '@/lib/site-config';
import { getLocalizedPath, hasLocale, type Locale } from '@/lib/i18n';
import { getEditorialRecordBySlug, localizeEditorialRecord } from '@/lib/editorial';

export default async function LocalizedNewsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const [record, config] = await Promise.all([getEditorialRecordBySlug('news-article', slug), getSiteConfig()]);
  if (!record || !record.published) notFound();

  const article = localizeEditorialRecord(record, locale);
  const dictionary = await getResolvedDictionary(locale, config);
  const formatter = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="w-full bg-white text-bmw-darkgray min-h-screen pt-28 pb-20">
      <article className="max-w-4xl mx-auto px-4">
        <Link href={getLocalizedPath(locale, '/news')} className="inline-flex items-center text-xs font-bold text-bmw-silver hover:text-bmw-black uppercase tracking-widest transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          {dictionary.news.back}
        </Link>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-bmw-blue">
            <span>{article.category}</span>
            {article.publishedAt && <span>{formatter.format(article.publishedAt)}</span>}
          </div>

          <h1 className="text-4xl md:text-5xl font-light text-bmw-black">{article.title}</h1>
          <p className="text-xl text-gray-500 leading-8">{article.summary}</p>

          {article.coverImageUrl && (
            <div className="overflow-hidden border border-gray-200 bg-bmw-lightgray">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.coverImageUrl} alt={article.title} className="w-full object-cover" />
            </div>
          )}

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 border border-gray-200 text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-gray max-w-none prose-p:leading-8 prose-p:text-gray-700 whitespace-pre-wrap">
            {article.content}
          </div>
        </div>
      </article>
    </div>
  );
}
