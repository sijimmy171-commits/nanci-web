'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import type { SiteDictionary } from '@/lib/site-content';
import {
  getProductCategories,
  getProductCategoryLabel,
  type ProductCategoryKey,
} from '@/lib/product-taxonomy';

interface Product {
  id: string;
  name: string;
  model: string;
  category: string;
  productCategory: ProductCategoryKey | null;
  specs: string | null;
  imageUrl?: string | null;
}

export default function ProductList({
  initialProducts,
  locale,
  dictionary,
  initialCategory,
}: {
  initialProducts: Product[];
  locale: Locale;
  dictionary: SiteDictionary;
  initialCategory?: ProductCategoryKey | null;
}) {
  const [activeCategory, setActiveCategory] = useState<ProductCategoryKey | 'all'>(initialCategory ?? 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = useMemo(() => getProductCategories(locale), [locale]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return initialProducts.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.productCategory === activeCategory;
      const matchesSearch = !query
        || product.name.toLowerCase().includes(query)
        || product.model.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, initialProducts, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-14 flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`border px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === 'all' ? 'border-bmw-black bg-bmw-black text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-bmw-black hover:text-bmw-black'}`}
          >
            {dictionary.products.tabs.all}
          </button>
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={`border px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === category.key ? 'border-bmw-black bg-bmw-black text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-bmw-black hover:text-bmw-black'}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:ml-auto md:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={dictionary.products.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full border border-gray-200 bg-bmw-lightgray py-3 pl-11 pr-4 text-sm text-bmw-black focus:border-bmw-blue focus:outline-none"
          />
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.article
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="flex min-w-0 flex-col border border-gray-200 bg-white"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-white">
                <div className="absolute right-4 top-4 z-10 border border-bmw-black/10 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bmw-black">
                  {getProductCategoryLabel(product.productCategory, locale) || product.category}
                </div>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-6" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-bmw-lightgray">
                    <Package className="h-20 w-20 text-bmw-silver/40" />
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 p-6">
                <h3 className="text-xl font-bold text-bmw-black">{product.name}</h3>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bmw-silver">{product.model}</div>
                <p className="mt-4 truncate text-sm font-light text-gray-500" title={product.specs || ''}>
                  {product.specs || (locale === 'zh' ? '规格待补充' : 'Specifications pending')}
                </p>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-28 text-center text-sm font-light uppercase tracking-widest text-gray-400">
            {dictionary.products.emptyState}
          </div>
        )}
      </motion.div>
    </div>
  );
}
