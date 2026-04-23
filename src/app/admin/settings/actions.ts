'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { publishedLocales } from '@/lib/i18n';
import { saveSiteConfig } from '@/lib/site-config';
import { getSiteContentOverrides, normalizeSiteContentOverrides, saveSiteContentOverrides } from '@/lib/site-content-overrides';
import { autoTranslateOverrides } from '@/lib/translation';
import { saveUploadedFile } from '@/lib/uploads';
import { requireAdminSession } from '@/lib/admin-auth';

export async function updateSiteConfig(formData: FormData): Promise<void> {
  await requireAdminSession();

  const heroTitle = formData.get('heroTitle') as string;
  const heroSub = formData.get('heroSub') as string;
  const contactMail = formData.get('contactMail') as string;
  const contactPhone = formData.get('contactPhone') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string;
  const wechatQrUrl = formData.get('wechatQrUrl') as string;
  const wechatQrFile = formData.get('wechatQrFile');
  const shouldAutoTranslate = formData.get('autoTranslate') === 'on';

  const existingOverrides = await getSiteContentOverrides();

  const overrides = normalizeSiteContentOverrides({
    footer: {
      brandDescription: {
        zh: formData.get('footerBrandDescriptionZh'),
        en: formData.get('footerBrandDescriptionEn'),
        es: existingOverrides.footer.brandDescription.es,
        fr: existingOverrides.footer.brandDescription.fr,
        ar: existingOverrides.footer.brandDescription.ar,
        ru: existingOverrides.footer.brandDescription.ru,
        de: existingOverrides.footer.brandDescription.de,
        id: existingOverrides.footer.brandDescription.id,
        vi: existingOverrides.footer.brandDescription.vi,
      },
    },
    products: {
      title: {
        zh: formData.get('productsTitleZh'),
        en: formData.get('productsTitleEn'),
        es: existingOverrides.products.title.es,
        fr: existingOverrides.products.title.fr,
        ar: existingOverrides.products.title.ar,
        ru: existingOverrides.products.title.ru,
        de: existingOverrides.products.title.de,
        id: existingOverrides.products.title.id,
        vi: existingOverrides.products.title.vi,
      },
      description: {
        zh: formData.get('productsDescriptionZh'),
        en: formData.get('productsDescriptionEn'),
        es: existingOverrides.products.description.es,
        fr: existingOverrides.products.description.fr,
        ar: existingOverrides.products.description.ar,
        ru: existingOverrides.products.description.ru,
        de: existingOverrides.products.description.de,
        id: existingOverrides.products.description.id,
        vi: existingOverrides.products.description.vi,
      },
      supportTitle: {
        zh: formData.get('productsSupportTitleZh'),
        en: formData.get('productsSupportTitleEn'),
        es: existingOverrides.products.supportTitle.es,
        fr: existingOverrides.products.supportTitle.fr,
        ar: existingOverrides.products.supportTitle.ar,
        ru: existingOverrides.products.supportTitle.ru,
        de: existingOverrides.products.supportTitle.de,
        id: existingOverrides.products.supportTitle.id,
        vi: existingOverrides.products.supportTitle.vi,
      },
      supportCta: {
        zh: formData.get('productsSupportCtaZh'),
        en: formData.get('productsSupportCtaEn'),
        es: existingOverrides.products.supportCta.es,
        fr: existingOverrides.products.supportCta.fr,
        ar: existingOverrides.products.supportCta.ar,
        ru: existingOverrides.products.supportCta.ru,
        de: existingOverrides.products.supportCta.de,
        id: existingOverrides.products.supportCta.id,
        vi: existingOverrides.products.supportCta.vi,
      },
      detailQuoteCta: {
        zh: formData.get('productsDetailQuoteCtaZh'),
        en: formData.get('productsDetailQuoteCtaEn'),
        es: existingOverrides.products.detailQuoteCta.es,
        fr: existingOverrides.products.detailQuoteCta.fr,
        ar: existingOverrides.products.detailQuoteCta.ar,
        ru: existingOverrides.products.detailQuoteCta.ru,
        de: existingOverrides.products.detailQuoteCta.de,
        id: existingOverrides.products.detailQuoteCta.id,
        vi: existingOverrides.products.detailQuoteCta.vi,
      },
      detailPdfCta: {
        zh: formData.get('productsDetailPdfCtaZh'),
        en: formData.get('productsDetailPdfCtaEn'),
        es: existingOverrides.products.detailPdfCta.es,
        fr: existingOverrides.products.detailPdfCta.fr,
        ar: existingOverrides.products.detailPdfCta.ar,
        ru: existingOverrides.products.detailPdfCta.ru,
        de: existingOverrides.products.detailPdfCta.de,
        id: existingOverrides.products.detailPdfCta.id,
        vi: existingOverrides.products.detailPdfCta.vi,
      },
    },
    contact: {
      title: {
        zh: formData.get('contactTitleZh'),
        en: formData.get('contactTitleEn'),
        es: existingOverrides.contact.title.es,
        fr: existingOverrides.contact.title.fr,
        ar: existingOverrides.contact.title.ar,
        ru: existingOverrides.contact.title.ru,
        de: existingOverrides.contact.title.de,
        id: existingOverrides.contact.title.id,
        vi: existingOverrides.contact.title.vi,
      },
      description: {
        zh: formData.get('contactDescriptionZh'),
        en: formData.get('contactDescriptionEn'),
        es: existingOverrides.contact.description.es,
        fr: existingOverrides.contact.description.fr,
        ar: existingOverrides.contact.description.ar,
        ru: existingOverrides.contact.description.ru,
        de: existingOverrides.contact.description.de,
        id: existingOverrides.contact.description.id,
        vi: existingOverrides.contact.description.vi,
      },
      formTitle: {
        zh: formData.get('contactFormTitleZh'),
        en: formData.get('contactFormTitleEn'),
        es: existingOverrides.contact.formTitle.es,
        fr: existingOverrides.contact.formTitle.fr,
        ar: existingOverrides.contact.formTitle.ar,
        ru: existingOverrides.contact.formTitle.ru,
        de: existingOverrides.contact.formTitle.de,
        id: existingOverrides.contact.formTitle.id,
        vi: existingOverrides.contact.formTitle.vi,
      },
      whatsappTitle: {
        zh: formData.get('contactWhatsappTitleZh'),
        en: formData.get('contactWhatsappTitleEn'),
        es: existingOverrides.contact.whatsappTitle.es,
        fr: existingOverrides.contact.whatsappTitle.fr,
        ar: existingOverrides.contact.whatsappTitle.ar,
        ru: existingOverrides.contact.whatsappTitle.ru,
        de: existingOverrides.contact.whatsappTitle.de,
        id: existingOverrides.contact.whatsappTitle.id,
        vi: existingOverrides.contact.whatsappTitle.vi,
      },
      hqAddress: {
        zh: formData.get('contactHqAddressZh'),
        en: formData.get('contactHqAddressEn'),
        es: existingOverrides.contact.hqAddress.es,
        fr: existingOverrides.contact.hqAddress.fr,
        ar: existingOverrides.contact.hqAddress.ar,
        ru: existingOverrides.contact.hqAddress.ru,
        de: existingOverrides.contact.hqAddress.de,
        id: existingOverrides.contact.hqAddress.id,
        vi: existingOverrides.contact.hqAddress.vi,
      },
      formMessagePlaceholder: {
        zh: formData.get('contactFormMessagePlaceholderZh'),
        en: formData.get('contactFormMessagePlaceholderEn'),
        es: existingOverrides.contact.formMessagePlaceholder.es,
        fr: existingOverrides.contact.formMessagePlaceholder.fr,
        ar: existingOverrides.contact.formMessagePlaceholder.ar,
        ru: existingOverrides.contact.formMessagePlaceholder.ru,
        de: existingOverrides.contact.formMessagePlaceholder.de,
        id: existingOverrides.contact.formMessagePlaceholder.id,
        vi: existingOverrides.contact.formMessagePlaceholder.vi,
      },
    },
  });

  let redirectTarget = '/admin/settings?status=saved&translation=manual';

  try {
    const resolvedWechatQrUrl = await saveUploadedFile({
      file: wechatQrFile instanceof File ? wechatQrFile : null,
      folder: 'wechat',
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      fallbackUrl: wechatQrUrl || null,
    });

    await saveSiteConfig({
      id: 'default',
      heroTitle,
      heroSub,
      contactMail,
      contactPhone,
      whatsappNumber,
      wechatQrUrl: resolvedWechatQrUrl,
    });

    let translationStatus = 'manual';
    let finalOverrides = overrides;

    if (shouldAutoTranslate) {
      try {
        const result = await autoTranslateOverrides(overrides);
        finalOverrides = result.overrides;
        translationStatus = result.translated ? 'done' : 'fallback';
      } catch (error) {
        console.error('Failed to auto-translate site content:', error);
        translationStatus = 'error';
      }
    }

    await saveSiteContentOverrides(finalOverrides);
    redirectTarget = `/admin/settings?status=saved&translation=${translationStatus}`;

    revalidatePath('/');
    for (const locale of publishedLocales) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/contact`);
      revalidatePath(`/${locale}/products`);
    }
    revalidatePath('/admin/settings');
  } catch (error) {
    console.error('Failed to update config:', error);
    throw new Error('数据库更新失败');
  }

  redirect(redirectTarget);
}
