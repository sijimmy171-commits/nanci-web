'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Package } from 'lucide-react';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import type { SiteDictionary } from '@/lib/site-content';
import {
  getDisplayCategoryLabel,
  getPrimaryCategories,
  getPrimaryCategoryLabel,
  getSpecificCategoryOptions,
  parseSpecificCategory,
  type ProductPrimaryCategoryKey,
  type ProductSecondaryCategoryKey,
  type ProductTertiaryCategoryKey,
} from '@/lib/product-taxonomy';

interface Product {
  id: string;
  name: string;
  model: string;
  category: string;
  primaryCategory: ProductPrimaryCategoryKey | null;
  secondaryCategory: ProductSecondaryCategoryKey | null;
  tertiaryCategory: ProductTertiaryCategoryKey | null;
  description: string | null;
  specs: string | null;
  imageUrl?: string | null;
  catalogUrl?: string | null;
  updatedAt: Date;
}

export default function ProductList({
  initialProducts,
  locale,
  dictionary,
  initialPrimaryCategory,
}: {
  initialProducts: Product[];
  locale: Locale;
  dictionary: SiteDictionary;
  initialPrimaryCategory?: ProductPrimaryCategoryKey | null;
}) {
  const [activePrimaryCategory, setActivePrimaryCategory] = useState<ProductPrimaryCategoryKey | 'all'>(initialPrimaryCategory ?? 'all');
  const [activeSpecificCategory, setActiveSpecificCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const primaryCategories = useMemo(() => getPrimaryCategories(locale), [locale]);
  const specificOptions = useMemo(
    () => (activePrimaryCategory === 'all' ? [] : getSpecificCategoryOptions(activePrimaryCategory, locale)),
    [activePrimaryCategory, locale]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const selectedSpecific = parseSpecificCategory(activeSpecificCategory);

    return initialProducts.filter((product) => {
      const matchesPrimary = activePrimaryCategory === 'all' || product.primaryCategory === activePrimaryCategory;
      const matchesSpecific =
        !activeSpecificCategory ||
        (product.secondaryCategory === selectedSpecific.secondaryCategory &&
          (selectedSpecific.tertiaryCategory ? product.tertiaryCategory === selectedSpecific.tertiaryCategory : true));
      const matchesSearch = product.name.toLowerCase().includes(query) || product.model.toLowerCase().includes(query);
      return matchesPrimary && matchesSpecific && matchesSearch;
    });
  }, [activePrimaryCategory, activeSpecificCategory, initialProducts, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-6 mb-16">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActivePrimaryCategory('all');
              setActiveSpecificCategory('');
            }}
            className={`px-6 py-3 text-xs tracking-widest font-bold uppercase transition-colors border ${
              activePrimaryCategory === 'all'
                ? 'border-bmw-black text-white bg-bmw-black'
                : 'border-gray-200 text-gray-500 hover:border-bmw-black hover:text-bmw-black bg-white'
            }`}
          >
            {dictionary.products.tabs.all}
          </button>
          {primaryCategories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => {
                setActivePrimaryCategory(category.key);
                setActiveSpecificCategory('');
              }}
              className={`px-6 py-3 text-xs tracking-widest font-bold uppercase transition-colors border ${
                activePrimaryCategory === category.key
                  ? 'border-bmw-black text-white bg-bmw-black'
                  : 'border-gray-200 text-gray-500 hover:border-bmw-black hover:text-bmw-black bg-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {activePrimaryCategory !== 'all' && (
              <select
                value={activeSpecificCategory}
                onChange={(event) => setActiveSpecificCategory(event.target.value)}
                className="min-w-64 bg-bmw-lightgray border border-gray-200 px-4 py-3 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors appearance-none"
              >
                <option value="">
                  {locale === 'zh'
                    ? `全部${getPrimaryCategoryLabel(activePrimaryCategory, locale)}`
                    : `All ${getPrimaryCategoryLabel(activePrimaryCategory, locale)}`}
                </option>
                {specificOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder={dictionary.products.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bmw-lightgray border border-gray-200 px-4 py-3 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="group flex flex-col bg-white border border-gray-200 hover:border-bmw-blue hover:shadow-xl transition-all duration-500"
            >
              <Link href={getLocalizedPath(locale, `/products/${product.id}`)} className="block aspect-[4/3] relative overflow-hidden bg-gray-100">
                <div className="absolute inset-0 bg-transparent group-hover:bg-bmw-blue/5 transition-colors duration-500 z-10" />
                <div className="absolute top-4 right-4 z-20 border border-bmw-black/10 bg-white/80 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-widest text-bmw-black font-bold">
                  {getDisplayCategoryLabel(product, locale) || product.category}
                </div>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity duration-700 group-hover:scale-105 transform">
                    <Package className="w-20 h-20 text-bmw-silver" />
                  </div>
                )}
              </Link>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-bmw-black mb-1 group-hover:text-bmw-blue transition-colors">{product.name}</h3>
                    <div className="text-[10px] text-bmw-silver uppercase tracking-[0.2em] font-mono font-bold">{product.model}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 font-light leading-relaxed mb-8 line-clamp-3">{product.description || dictionary.products.detail.fallbackDescription}</p>

                <Link
                  href={getLocalizedPath(locale, `/products/${product.id}`)}
                  className="mt-auto border-t border-gray-200 pt-6 flex justify-between items-center text-xs tracking-widest uppercase font-bold text-gray-400 group-hover:text-bmw-blue transition-colors"
                >
                  <span>{dictionary.products.viewDetails}</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-32 text-center text-gray-400 font-light italic uppercase tracking-widest">
            {dictionary.products.emptyState}
          </div>
        )}
      </motion.div>
    </div>
  );
}
