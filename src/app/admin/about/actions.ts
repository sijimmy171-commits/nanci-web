'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { publishedLocales } from '@/lib/i18n';
import { getAboutContent, normalizeAboutContent, saveAboutContent } from '@/lib/about-content';
import { autoTranslateLocalizedFields } from '@/lib/translation';
import { saveUploadedFile } from '@/lib/uploads';
import { requireAdminSession } from '@/lib/admin-auth';

function parseTimeline(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [year = '', titleZh = '', titleEn = '', descriptionZh = '', descriptionEn = ''] = line.split('|').map((item) => item.trim());
      return {
        year,
        title: { zh: titleZh, en: titleEn },
        description: { zh: descriptionZh, en: descriptionEn },
      };
    });
}

async function parseReports(formData: FormData, existingReportsCount: number) {
  const count = Number(formData.get('reportsCount') || 0);
  const reports = [];

  for (let index = 0; index < count; index += 1) {
    const date = String(formData.get(`reports.${index}.date`) || '').trim();
    const titleZh = String(formData.get(`reports.${index}.titleZh`) || '').trim();
    const titleEn = String(formData.get(`reports.${index}.titleEn`) || '').trim();
    const issuerZh = String(formData.get(`reports.${index}.issuerZh`) || '').trim();
    const issuerEn = String(formData.get(`reports.${index}.issuerEn`) || '').trim();
    const summaryZh = String(formData.get(`reports.${index}.summaryZh`) || '').trim();
    const summaryEn = String(formData.get(`reports.${index}.summaryEn`) || '').trim();
    const fileUrl = String(formData.get(`reports.${index}.fileUrl`) || '').trim();
    const existingImageUrl = String(formData.get(`reports.${index}.existingImageUrl`) || '').trim();
    const imageFile = formData.get(`reports.${index}.image`) as File | null;

    const imageUrl = await saveUploadedFile({
      file: imageFile,
      folder: 'reports',
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      fallbackUrl: existingImageUrl,
    });

    const hasContent = date || titleZh || titleEn || issuerZh || issuerEn || summaryZh || summaryEn || fileUrl || imageUrl;
    const isTrailingBlank = index >= existingReportsCount && !hasContent;
    if (isTrailingBlank || !hasContent) {
      continue;
    }

    reports.push({
      date,
      title: { zh: titleZh, en: titleEn },
      issuer: { zh: issuerZh, en: issuerEn },
      summary: { zh: summaryZh, en: summaryEn },
      imageUrl: imageUrl || '',
      fileUrl,
    });
  }

  return reports;
}

export async function updateAboutContent(formData: FormData): Promise<void> {
  await requireAdminSession();

  const existing = await getAboutContent();
  const reports = await parseReports(formData, existing.reports.length);

  let next = normalizeAboutContent({
    heroTitle: { ...existing.heroTitle, zh: formData.get('heroTitleZh'), en: formData.get('heroTitleEn') },
    heroDescription: { ...existing.heroDescription, zh: formData.get('heroDescriptionZh'), en: formData.get('heroDescriptionEn') },
    intro: {
      title: { ...existing.intro.title, zh: formData.get('introTitleZh'), en: formData.get('introTitleEn') },
      body: { ...existing.intro.body, zh: formData.get('introBodyZh'), en: formData.get('introBodyEn') },
    },
    capability: {
      title: { ...existing.capability.title, zh: formData.get('capabilityTitleZh'), en: formData.get('capabilityTitleEn') },
      body: { ...existing.capability.body, zh: formData.get('capabilityBodyZh'), en: formData.get('capabilityBodyEn') },
    },
    culture: {
      title: { ...existing.culture.title, zh: formData.get('cultureTitleZh'), en: formData.get('cultureTitleEn') },
      body: { ...existing.culture.body, zh: formData.get('cultureBodyZh'), en: formData.get('cultureBodyEn') },
    },
    timelineTitle: { ...existing.timelineTitle, zh: formData.get('timelineTitleZh'), en: formData.get('timelineTitleEn') },
    timeline: parseTimeline((formData.get('timelineText') as string) || ''),
    reportsTitle: { ...existing.reportsTitle, zh: formData.get('reportsTitleZh'), en: formData.get('reportsTitleEn') },
    reportsDescription: { ...existing.reportsDescription, zh: formData.get('reportsDescriptionZh'), en: formData.get('reportsDescriptionEn') },
    reports,
    partnersTitle: { ...existing.partnersTitle, zh: formData.get('partnersTitleZh'), en: formData.get('partnersTitleEn') },
    partnersDescription: { ...existing.partnersDescription, zh: formData.get('partnersDescriptionZh'), en: formData.get('partnersDescriptionEn') },
    partners: ((formData.get('partnersText') as string) || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  });

  if (formData.get('autoTranslate') === 'on') {
    try {
      const result = await autoTranslateLocalizedFields([
        { path: 'heroTitle', zh: next.heroTitle.zh, en: next.heroTitle.en },
        { path: 'heroDescription', zh: next.heroDescription.zh, en: next.heroDescription.en },
        { path: 'intro.title', zh: next.intro.title.zh, en: next.intro.title.en },
        { path: 'intro.body', zh: next.intro.body.zh, en: next.intro.body.en },
        { path: 'capability.title', zh: next.capability.title.zh, en: next.capability.title.en },
        { path: 'capability.body', zh: next.capability.body.zh, en: next.capability.body.en },
        { path: 'culture.title', zh: next.culture.title.zh, en: next.culture.title.en },
        { path: 'culture.body', zh: next.culture.body.zh, en: next.culture.body.en },
        { path: 'timelineTitle', zh: next.timelineTitle.zh, en: next.timelineTitle.en },
        { path: 'reportsTitle', zh: next.reportsTitle.zh, en: next.reportsTitle.en },
        { path: 'reportsDescription', zh: next.reportsDescription.zh, en: next.reportsDescription.en },
        { path: 'partnersTitle', zh: next.partnersTitle.zh, en: next.partnersTitle.en },
        { path: 'partnersDescription', zh: next.partnersDescription.zh, en: next.partnersDescription.en },
      ]);

      if (result.translations) {
        next = normalizeAboutContent({
          ...next,
          heroTitle: { ...next.heroTitle, ...result.translations.heroTitle },
          heroDescription: { ...next.heroDescription, ...result.translations.heroDescription },
          intro: {
            title: { ...next.intro.title, ...result.translations['intro.title'] },
            body: { ...next.intro.body, ...result.translations['intro.body'] },
          },
          capability: {
            title: { ...next.capability.title, ...result.translations['capability.title'] },
            body: { ...next.capability.body, ...result.translations['capability.body'] },
          },
          culture: {
            title: { ...next.culture.title, ...result.translations['culture.title'] },
            body: { ...next.culture.body, ...result.translations['culture.body'] },
          },
          timelineTitle: { ...next.timelineTitle, ...result.translations.timelineTitle },
          reportsTitle: { ...next.reportsTitle, ...result.translations.reportsTitle },
          reportsDescription: { ...next.reportsDescription, ...result.translations.reportsDescription },
          partnersTitle: { ...next.partnersTitle, ...result.translations.partnersTitle },
          partnersDescription: { ...next.partnersDescription, ...result.translations.partnersDescription },
        });
      }
    } catch (error) {
      console.error('Failed to auto-translate about content:', error);
    }
  }

  await saveAboutContent(next);

  for (const locale of publishedLocales) {
    revalidatePath(`/${locale}/about`);
  }
  revalidatePath('/admin/about');
  redirect('/admin/about?status=saved');
}
