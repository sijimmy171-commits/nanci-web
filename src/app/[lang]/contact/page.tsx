import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import ContactForm from '../../contact/ContactForm';
import { getSiteConfig } from '@/lib/site-config';
import { getResolvedDictionary } from '@/lib/site-content';
import { hasLocale, type Locale } from '@/lib/i18n';

export default async function LocalizedContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const config = await getSiteConfig();
  const dictionary = await getResolvedDictionary(locale, config);
  const qrImageSrc = config?.wechatQrUrl || '/wechat-qr-placeholder.svg';
  const qrHint = locale === 'zh' ? '后台上传真实二维码后会自动替换这里的占位图。' : 'Upload a real WeChat QR in admin settings to replace this placeholder.';

  return (
    <div className="w-full bg-white text-bmw-darkgray min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-20 border-b border-gray-100">
        <h1 className="text-sm font-bold text-bmw-blue tracking-[0.3em] uppercase mb-4">{dictionary.contact.eyebrow}</h1>
        <h2 className="text-4xl md:text-5xl font-light tracking-wide mb-6 text-bmw-black">{dictionary.contact.title}</h2>
        <p className="text-gray-500 font-light max-w-2xl text-lg">{dictionary.contact.description}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col lg:flex-row gap-16">
        <div className="lg:w-1/3 border-r border-gray-100 pr-8">
          <div className="space-y-10">
            <div className="group">
              <Phone className="w-6 h-6 text-bmw-blue mb-4 opacity-80" />
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-mono font-bold">{dictionary.contact.phone}</div>
              <div className="text-lg font-bold text-bmw-black tracking-wide">{config?.contactPhone}</div>
            </div>

            <div className="group">
              <Mail className="w-6 h-6 text-bmw-blue mb-4 opacity-80" />
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-mono font-bold">{dictionary.contact.email}</div>
              <div className="text-lg font-bold text-bmw-black tracking-wide">{config?.contactMail}</div>
            </div>

            {config?.whatsappNumber && (
              <div className="group bg-green-50/50 p-6 border-l-2 border-green-500">
                <div className="flex items-center text-green-600 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span className="text-xs font-bold uppercase tracking-widest">{dictionary.contact.whatsappTitle}</span>
                </div>
                <div className="text-lg font-bold text-bmw-black">{config.whatsappNumber}</div>
              </div>
            )}

            <div className="group">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-3 font-mono font-bold">{dictionary.contact.wechat}</div>
              <div className="w-32 h-32 bg-bmw-lightgray border border-gray-100 p-2 group-hover:shadow-lg transition-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrImageSrc} alt={dictionary.contact.wechatAlt} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
              </div>
              {!config?.wechatQrUrl && <p className="mt-3 text-xs text-gray-400 leading-relaxed">{qrHint}</p>}
            </div>

            <div className="group">
              <MapPin className="w-6 h-6 text-bmw-blue mb-4 opacity-80" />
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-mono font-bold">{dictionary.contact.hq}</div>
              <div className="text-sm font-bold text-bmw-black tracking-wide leading-relaxed">{dictionary.contact.hqAddress}</div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          <h3 className="text-2xl font-light mb-8 text-bmw-black">{dictionary.contact.formTitle}</h3>
          <ContactForm locale={locale} dictionary={dictionary} />
        </div>
      </div>
    </div>
  );
}
