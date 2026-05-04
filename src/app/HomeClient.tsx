'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import type { SiteDictionary } from '@/lib/site-content';
import ContactForm from './contact/ContactForm';

type FeaturedProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

interface HomeClientProps {
  locale: Locale;
  dictionary: SiteDictionary;
  products: FeaturedProduct[];
}

export default function HomeClient({ locale, dictionary, products }: HomeClientProps) {
  const home = dictionary.home;
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroBackgroundUrl = '/home-hero-power-lines.png';

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % home.heroSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [home.heroSlides.length]);

  const currentHero = home.heroSlides[currentSlide];

  return (
    <div className="w-full bg-white text-bmw-darkgray">
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-bmw-black">
        <div className="absolute inset-0 z-0 text-white/5">
          <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${heroBackgroundUrl})` }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bmw-graphite/80 via-bmw-black to-bmw-black opacity-80" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSlide}-${currentHero.title}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative z-10 max-w-7xl mx-auto px-4 text-center mt-20"
          >
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="inline-block border border-bmw-graphite/60 bg-bmw-black/50 backdrop-blur-md px-4 py-1 text-xs font-bold text-bmw-silver tracking-[0.3em] uppercase mb-8">
              {currentHero.eyebrow}
            </motion.div>

            <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter">
              {currentHero.title.split('\n')[0]} <br />
              <span className="text-bmw-lightgray font-light tracking-wide">{currentHero.title.split('\n')[1] || ''}</span>
            </motion.h1>

            <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-xl md:text-2xl text-bmw-silver mb-12 font-light tracking-wider max-w-3xl mx-auto">
              {currentHero.subtitle}
            </motion.p>

            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href={getLocalizedPath(locale, currentHero.primaryHref)} className="group relative overflow-hidden bg-white text-bmw-black px-10 py-4 font-bold text-sm tracking-widest uppercase flex items-center justify-center w-full sm:w-auto shadow-lg">
                <span className="relative z-10">{currentHero.primaryCta}</span>
                <div className="absolute inset-0 bg-bmw-lightgray transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Link>
              <Link href={getLocalizedPath(locale, currentHero.secondaryHref)} className="group border border-bmw-graphite px-10 py-4 text-white font-bold text-sm tracking-widest uppercase hover:border-bmw-silver transition-colors flex items-center justify-center w-full sm:w-auto bg-white/5 backdrop-blur-sm">
                <span className="mr-2">{currentHero.secondaryCta}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center space-x-3">
          {home.heroSlides.map((slide, index) => (
            <button
              key={slide.eyebrow}
              type="button"
              aria-label={slide.title}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 transition-all duration-300 rounded-full ${currentSlide === index ? 'w-10 bg-white' : 'w-6 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </section>

      <section className="py-24 bg-bmw-lightgray border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3">
              <div className="w-12 h-1 bg-bmw-blue mb-8" />
              <h2 className="text-4xl font-light text-bmw-black mb-6 tracking-wide">
                {home.valueTitle}
                <br />
                <span className="font-bold">{home.valueTitleEmphasis}</span>
              </h2>
              <p className="text-gray-600 leading-relaxed font-light mb-8">{home.valueDescription}</p>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {home.valueCards.map((item) => (
                <div key={item.n} className="p-8 border border-gray-200 bg-white hover:border-bmw-blue/30 hover:shadow-lg transition-all duration-300 group">
                  <div className="text-bmw-silver font-mono text-xl mb-4 group-hover:text-bmw-blue transition-colors">{item.n} / /</div>
                  <h3 className="text-xl font-bold text-bmw-black mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="product-categories" className="py-24 bg-white relative scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between text-bmw-black">
            <div>
              <h2 className="text-xs font-bold text-bmw-silver tracking-[0.3em] uppercase mb-3">{home.featuredEyebrow}</h2>
              <h3 className="text-4xl font-light tracking-wide">{home.featuredTitle}</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={getLocalizedPath(locale, `/products/${product.id}`)} className="group relative bg-bmw-lightgray border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-[linear-gradient(135deg,#dbe4ee,#f8fafc)]" />
                  )}
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-bold text-bmw-black mb-4">{product.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description || dictionary.products.detail.fallbackDescription}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 border-t border-gray-200 pt-16">
            <div>
              <p className="text-xs font-bold text-bmw-blue tracking-[0.3em] uppercase mb-4">{home.bottomCtaEyebrow}</p>
              <h3 className="text-3xl md:text-4xl font-light tracking-wide text-bmw-black mb-6">{home.bottomCtaTitle}</h3>
              <p className="text-gray-500 font-light leading-8">{home.bottomCtaDescription}</p>
            </div>
            <div className="bg-white">
              <h4 className="text-2xl font-light mb-8 text-bmw-black">{dictionary.contact.formTitle}</h4>
              <ContactForm locale={locale} dictionary={dictionary} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
