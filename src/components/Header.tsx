'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { getLocalizedPath, localeLabels, publishedLocales, removeLocaleFromPath, type Locale } from '@/lib/i18n';
import type { SiteDictionary } from '@/lib/site-content';
import { getPrimaryCategories } from '@/lib/product-taxonomy';

function getBasePath(path: string) {
  return path.split(/[?#]/)[0] || '/';
}

export default function Header({ locale, dictionary }: { locale: Locale; dictionary: SiteDictionary }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparentWithWhiteText = !isScrolled;
  const currentPath = removeLocaleFromPath(pathname || '/');
  const productMenuItems = [
    ...getPrimaryCategories(locale).map((category) => ({
      id: `/products?primary=${category.key}`,
      label: category.label,
    })),
    {
      id: '/products#documents',
      label: locale === 'zh' ? '产品资料下载' : 'Product Documents',
    },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-panel border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={getLocalizedPath(locale, '/')} className="flex-shrink-0 flex items-center">
            <span className={`text-3xl font-black tracking-widest ${isTransparentWithWhiteText ? 'text-white' : 'text-bmw-black'} transition-colors`}>
              SUCI<span className="text-bmw-blue">.</span>
            </span>
            <span className={`text-lg font-bold ${isTransparentWithWhiteText ? 'text-white/80 border-white/30' : 'text-gray-600 border-gray-300'} hidden sm:block border-l ml-3 pl-3 transition-colors`}>
              {dictionary.brand.localName}
            </span>
          </Link>

          <nav className="hidden lg:flex space-x-2 h-full">
            {dictionary.header.links.map((link) => {
              const children = link.id === '/products' ? productMenuItems : link.children;
              const href = getLocalizedPath(locale, link.id);
              const basePath = getBasePath(link.id);
              const isActive = currentPath === basePath || (basePath !== '/' && currentPath.startsWith(basePath));
              const textClass = isActive
                ? 'border-bmw-blue ' + (isTransparentWithWhiteText ? 'text-white' : 'text-bmw-blue')
                : 'border-transparent ' + (isTransparentWithWhiteText ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-bmw-black');

              if (!children?.length) {
                return (
                  <Link
                    key={link.id}
                    href={href}
                    className={`flex items-center px-4 text-sm font-medium tracking-widest uppercase transition-colors border-b-2 h-full ${textClass}`}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <div key={link.id} className="group relative h-full">
                  <Link
                    href={href}
                    className={`flex items-center gap-2 px-4 text-sm font-medium tracking-widest uppercase transition-colors border-b-2 h-full ${textClass}`}
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4" />
                  </Link>
                  <div className="absolute left-0 top-full min-w-64 bg-white border border-gray-100 shadow-2xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={getLocalizedPath(locale, child.id)}
                        className="block px-5 py-4 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 hover:text-bmw-blue transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className={`hidden lg:flex items-center text-sm font-medium ${isTransparentWithWhiteText ? 'text-white/80' : 'text-gray-600'}`}>
            <div className="group relative py-8 cursor-pointer flex items-center space-x-1 hover:text-bmw-blue transition-colors">
              <Globe className="w-4 h-4" />
              <span>{dictionary.header.languageShort}</span>
              <div className="absolute right-0 top-16 w-40 bg-white rounded-sm shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {publishedLocales.map((targetLocale) => (
                  <Link
                    key={targetLocale}
                    href={getLocalizedPath(targetLocale, currentPath)}
                    className={`block px-4 py-3 text-sm transition-colors ${targetLocale === locale ? 'text-bmw-blue bg-gray-50' : 'text-gray-700 hover:bg-gray-50 hover:text-bmw-blue'}`}
                  >
                    {localeLabels[targetLocale]}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={isTransparentWithWhiteText ? 'text-white' : 'text-bmw-black'}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 absolute top-20 left-0 right-0 shadow-2xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {dictionary.header.links.map((link) => {
              const children = link.id === '/products' ? productMenuItems : link.children;
              const hasChildren = Boolean(children?.length);
              if (!hasChildren) {
                return (
                  <Link
                    key={link.id}
                    href={getLocalizedPath(locale, link.id)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-4 text-base font-medium tracking-wider text-gray-700 border-b border-gray-100 hover:bg-gray-50 hover:text-bmw-blue"
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <div key={link.id} className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <Link
                      href={getLocalizedPath(locale, link.id)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 px-3 py-4 text-base font-medium tracking-wider text-gray-700 hover:text-bmw-blue"
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setExpandedGroups((current) => ({ ...current, [link.id]: !current[link.id] }))}
                      className="px-3 text-gray-500"
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform ${expandedGroups[link.id] ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {expandedGroups[link.id] && (
                    <div className="pb-3">
                      {children?.map((child) => (
                        <Link
                          key={child.id}
                          href={getLocalizedPath(locale, child.id)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-6 py-3 text-sm text-gray-600 hover:text-bmw-blue"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-2">
              {publishedLocales.map((targetLocale) => (
                <Link
                  key={targetLocale}
                  href={getLocalizedPath(targetLocale, currentPath)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 text-sm text-gray-600 hover:text-bmw-blue"
                >
                  {localeLabels[targetLocale]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
