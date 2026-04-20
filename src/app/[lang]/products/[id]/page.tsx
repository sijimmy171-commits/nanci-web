import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Globe, ShieldCheck, Zap } from 'lucide-react';
import { getLocalizedProductById } from '@/lib/product-content';
import { getSiteConfig } from '@/lib/site-config';
import { getResolvedDictionary } from '@/lib/site-content';
import { getLocalizedPath, hasLocale, type Locale } from '@/lib/i18n';
import { getCategoryTrailLabels } from '@/lib/product-taxonomy';

export default async function LocalizedProductDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const config = await getSiteConfig();
  const dictionary = await getResolvedDictionary(locale, config);

  const product = await getLocalizedProductById(id, locale);

  if (!product) notFound();

  const categoryTrail = getCategoryTrailLabels(product, locale);

  return (
    <div className="w-full bg-white text-bmw-darkgray min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <Link href={getLocalizedPath(locale, '/products')} className="inline-flex items-center text-xs font-bold text-bmw-silver hover:text-bmw-black uppercase tracking-widest transition-colors mb-4 group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> {dictionary.products.detail.back}
          </Link>
          <div className="h-px w-20 bg-bmw-blue"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2">
            <div className="aspect-[4/3] bg-bmw-lightgray border border-gray-100 flex items-center justify-center relative overflow-hidden group shadow-inner">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                  <div className="relative z-10 text-center">
                    <span className="text-8xl font-black text-white/50 tracking-tighter drop-shadow-sm select-none">SUCI</span>
                    <div className="mt-4 text-[10px] font-bold text-bmw-silver uppercase tracking-[0.5em]">{product.model}</div>
                  </div>
                  <div className="absolute top-0 right-0 p-8">
                    <div className="text-[10px] font-black text-bmw-silver rotate-90 origin-right uppercase tracking-[0.3em] opacity-40">
                      PRECISION ENGINEERING // {product.id.substring(0, 8)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[ShieldCheck, Zap, Globe].map((Icon, i) => (
                <div key={i} className="bg-white border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                  <Icon className="w-6 h-6 text-bmw-blue mb-3 opacity-80" />
                  <div className="text-[10px] font-black text-bmw-black uppercase tracking-widest">
                    {i === 0
                      ? dictionary.products.detail.featureLabels.certified
                      : i === 1
                        ? dictionary.products.detail.featureLabels.highPower
                        : dictionary.products.detail.featureLabels.global}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="mb-8">
              <span className="text-xs font-bold text-bmw-blue uppercase tracking-[0.3em] mb-4 block">{categoryTrail.join(' / ') || product.category}</span>
              <h1 className="text-4xl md:text-5xl font-black text-bmw-black mb-4 tracking-tighter uppercase">{product.name}</h1>
              <div className="inline-block bg-bmw-black text-white px-4 py-1 text-xs font-mono font-bold tracking-widest uppercase">
                {dictionary.products.detail.modelLabel}: {product.model}
              </div>
            </div>

            <p className="text-lg text-gray-500 font-light leading-relaxed mb-12 border-l-2 border-gray-100 pl-6 italic">
              {product.description || dictionary.products.detail.fallbackDescription}
            </p>

            <div className="space-y-10">
              <div>
                <h3 className="text-xs font-black text-bmw-black uppercase tracking-[0.2em] mb-6 flex items-center">
                  <div className="w-6 h-px bg-bmw-black mr-4"></div> {dictionary.products.detail.specsTitle}
                </h3>
                <div className="bg-bmw-lightgray border border-gray-100 overflow-hidden">
                  <pre className="p-8 text-sm text-bmw-black font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {product.specs || dictionary.products.detail.fallbackSpecs}
                  </pre>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-10">
                <Link href={getLocalizedPath(locale, '/contact')} className="bg-bmw-black text-white px-10 py-5 font-bold text-xs tracking-widest uppercase flex items-center justify-center hover:bg-bmw-blue transition-all shadow-xl flex-1">
                  {dictionary.products.detail.quoteCta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
