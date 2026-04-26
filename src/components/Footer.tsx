import React from 'react';
import Link from 'next/link';
import { Phone, Mail, ChevronRight } from 'lucide-react';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import type { SiteConfigRecord } from '@/lib/site-config';
import type { SiteDictionary } from '@/lib/site-content';

export default function Footer({ locale, dictionary, config }: { locale: Locale; dictionary: SiteDictionary; config: SiteConfigRecord | null }) {
  return (
    <footer className="bg-bmw-lightgray border-t border-gray-200 pt-20 pb-10 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center mb-6">
              <span className="text-3xl font-black tracking-widest text-bmw-black">SUCI<span className="text-bmw-blue">.</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{dictionary.footer.brandDescription}</p>
          </div>

          <div>
            <h4 className="text-bmw-black font-bold uppercase tracking-widest text-sm mb-6">{dictionary.footer.coreSeriesTitle}</h4>
            <ul className="space-y-4">
              {dictionary.footer.coreSeries.map((item) => (
                <li key={item}>
                  <Link href={getLocalizedPath(locale, '/products')} className="text-sm hover:text-bmw-blue transition-colors flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-2 text-gray-400 group-hover:text-bmw-blue transition-colors" /> {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-bmw-black font-bold uppercase tracking-widest text-sm mb-6">{dictionary.footer.quickLinksTitle}</h4>
            <ul className="space-y-4">
              {dictionary.header.links.filter((item) => item.id !== '/').map((item) => (
                <li key={item.id}>
                  <Link href={getLocalizedPath(locale, item.id)} className="text-sm hover:text-bmw-blue transition-colors flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-2 text-gray-400 group-hover:text-bmw-blue transition-colors" /> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-bmw-black font-bold uppercase tracking-widest text-sm mb-6">{dictionary.footer.contactTitle}</h4>
            <ul className="space-y-4">
              <li className="flex items-center group cursor-pointer">
                <Phone className="w-4 h-4 mr-3 text-bmw-blue" />
                <span className="text-sm group-hover:text-bmw-black transition-colors">{config?.contactPhone || '400-888-9999'}</span>
              </li>
              <li className="flex items-center group cursor-pointer">
                <Mail className="w-4 h-4 mr-3 text-bmw-blue" />
                <span className="text-sm group-hover:text-bmw-black transition-colors">{config?.contactMail || 'info@suci.com'}</span>
              </li>
              {config?.whatsappNumber && (
                <li className="flex items-center group cursor-pointer">
                  <span className="text-bmw-blue mr-3 font-bold text-xs">WA</span>
                  <span className="text-sm group-hover:text-bmw-black transition-colors">{config.whatsappNumber}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {dictionary.footer.copyright}</p>
          <div className="flex space-x-6 mt-4 md:mt-0 uppercase tracking-widest font-medium">
            <span className="hover:text-bmw-blue cursor-pointer transition-colors">{dictionary.footer.privacy}</span>
            <span className="hover:text-bmw-blue cursor-pointer transition-colors">{dictionary.footer.legal}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
