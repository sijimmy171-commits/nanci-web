'use client';

import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { createInquiry } from './actions';
import type { Locale } from '@/lib/i18n';
import type { SiteDictionary } from '@/lib/site-content';
import { getProductCategories } from '@/lib/product-taxonomy';

export default function ContactForm({ locale, dictionary }: { locale: Locale; dictionary: SiteDictionary }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const formCopy = dictionary.contact.form;
  const productCategories = getProductCategories(locale);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(form);
    formData.set('locale', locale);
    const result = await createInquiry(formData);

    if (result.success) {
      setIsSuccess(true);
      form.reset();
    } else {
      setError(result.error || formCopy.errorFallback);
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-20 bg-bmw-lightgray/50 border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-3xl font-bold text-bmw-black">{formCopy.successTitle}</h2>
        <p className="text-gray-500 font-light max-w-sm mx-auto">{formCopy.successDescription}</p>
        <button onClick={() => setIsSuccess(false)} className="inline-block border border-bmw-black px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-bmw-black hover:text-white transition-all shadow-md">
          {formCopy.successReset}
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {error && <div className="p-4 bg-bmw-red/5 border border-bmw-red/10 text-bmw-red text-xs font-bold uppercase tracking-widest text-center">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 group-focus-within:text-bmw-blue transition-colors">{formCopy.fullName}</label>
          <input required name="clientName" type="text" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors" placeholder="John Doe" />
        </div>
        <div className="group">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 group-focus-within:text-bmw-blue transition-colors">{formCopy.email}</label>
          <input required name="clientEmail" type="email" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors" placeholder="john@company.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 group-focus-within:text-bmw-blue transition-colors">{formCopy.company}</label>
          <input name="companyName" type="text" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors" />
        </div>
        <div className="group">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 group-focus-within:text-bmw-blue transition-colors">{formCopy.phone}</label>
          <input name="phone" type="tel" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors" placeholder="+86 138 0000 0000" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 group-focus-within:text-bmw-blue transition-colors">{formCopy.product}</label>
          <select name="productType" className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors appearance-none">
            <option value="Not Specified">{formCopy.selectPlaceholder}</option>
            {productCategories.map((category) => (
              <option key={category.key} value={category.label}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden md:block" />
      </div>

      <div className="group">
        <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-4 group-focus-within:text-bmw-blue transition-colors">{formCopy.message}</label>
        <textarea required name="message" rows={5} className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm text-bmw-black focus:outline-none focus:border-bmw-blue transition-colors resize-none" placeholder={formCopy.messagePlaceholder}></textarea>
      </div>

      <button disabled={isSubmitting} type="submit" className="group flex items-center justify-between w-full sm:w-auto bg-bmw-black text-white px-10 py-4 font-bold text-xs tracking-widest uppercase hover:bg-bmw-blue transition-colors disabled:opacity-50 shadow-xl">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-8" /> : <><span>{formCopy.submit}</span><ArrowRight className="w-4 h-4 ml-8 transform group-hover:translate-x-1 transition-transform" /></>}
      </button>
    </form>
  );
}
