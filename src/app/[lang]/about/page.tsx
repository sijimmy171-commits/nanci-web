import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import { getAboutContent, resolveAboutContent } from '@/lib/about-content';
import { getResolvedDictionary } from '@/lib/site-content';
import { getSiteConfig } from '@/lib/site-config';
import { hasLocale, type Locale } from '@/lib/i18n';

export default async function LocalizedAboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const [aboutContent, config] = await Promise.all([getAboutContent(), getSiteConfig()]);
  const about = resolveAboutContent(aboutContent, locale);
  const dictionary = await getResolvedDictionary(locale, config);

  return (
    <div className="w-full bg-white text-bmw-darkgray min-h-screen">
      <section className="bg-bmw-black text-white pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-bmw-blue text-xs font-bold tracking-[0.3em] uppercase mb-4">{dictionary.about.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-wide max-w-4xl">{about.heroTitle || dictionary.about.title}</h1>
          <p className="mt-6 max-w-3xl text-lg text-bmw-silver font-light leading-relaxed">
            {about.heroDescription || dictionary.about.description}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-4">
            <div className="h-px w-16 bg-bmw-blue" />
            <p className="text-sm text-gray-500 leading-relaxed">{dictionary.about.description}</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div id="company-profile" className="border border-gray-200 p-8 scroll-mt-32">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-bmw-blue mb-4">{dictionary.about.introLabel}</p>
            <h2 className="text-3xl font-light text-bmw-black mb-4">{about.intro.title}</h2>
            <p className="text-gray-600 leading-8 whitespace-pre-wrap">{about.intro.body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 p-8 bg-bmw-lightgray/40">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-bmw-blue mb-4">{dictionary.about.capabilityLabel}</p>
              <h2 className="text-2xl font-light text-bmw-black mb-4">{about.capability.title}</h2>
              <p className="text-gray-600 leading-8 whitespace-pre-wrap">{about.capability.body}</p>
            </div>

            <div id="culture" className="border border-gray-200 p-8 bg-bmw-lightgray/40 scroll-mt-32">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-bmw-blue mb-4">{dictionary.about.cultureLabel}</p>
              <h2 className="text-2xl font-light text-bmw-black mb-4">{about.culture.title}</h2>
              <p className="text-gray-600 leading-8 whitespace-pre-wrap">{about.culture.body}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="timeline" className="bg-bmw-lightgray/40 py-20 px-4 scroll-mt-32">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-bmw-blue mb-4">{dictionary.about.timelineLabel}</p>
          <h2 className="text-3xl md:text-4xl font-light text-bmw-black mb-10">{about.timelineTitle}</h2>
          <div className="space-y-6">
            {about.timeline.map((item) => (
              <div key={`${item.year}-${item.title}`} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 border-t border-gray-200 pt-6">
                <div className="text-bmw-blue text-2xl font-black tracking-tight">{item.year}</div>
                <div>
                  <h3 className="text-xl font-semibold text-bmw-black mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-7">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="test-reports" className="py-20 px-4 scroll-mt-32">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-bmw-blue mb-4">{dictionary.about.reportsLabel}</p>
          <h2 className="text-3xl md:text-4xl font-light text-bmw-black mb-4">{about.reportsTitle}</h2>
          <p className="text-gray-600 max-w-3xl leading-8 mb-10">{about.reportsDescription}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {about.reports.map((report) => (
              <article key={`${report.date}-${report.title}`} className="border border-gray-200 bg-white overflow-hidden">
                <div className="relative aspect-[4/5] bg-bmw-lightgray">
                  {report.imageUrl ? (
                    <Image src={report.imageUrl} alt={report.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-400">Report Cover</div>
                  )}
                </div>
                <div className="p-8 flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-bmw-blue">{report.date}</span>
                    {report.fileUrl ? (
                      <Link href={report.fileUrl} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bmw-black hover:text-bmw-blue transition-colors">
                        <Download className="w-4 h-4" />
                        PDF
                      </Link>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-bmw-black leading-8">{report.title}</h3>
                    <p className="mt-3 text-sm font-medium text-gray-500">{report.issuer}</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-7">{report.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-bmw-blue mb-4">{dictionary.about.partnersLabel}</p>
          <h2 className="text-3xl md:text-4xl font-light text-bmw-black mb-4">{about.partnersTitle}</h2>
          <p className="text-gray-600 max-w-3xl leading-8 mb-10">{about.partnersDescription}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {about.partners.map((partner) => (
              <div key={partner} className="border border-gray-200 px-4 py-6 text-center text-sm font-semibold text-bmw-black bg-white">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
