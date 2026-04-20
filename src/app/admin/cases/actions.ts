'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { publishedLocales } from '@/lib/i18n';
import { autoTranslateLocalizedFields } from '@/lib/translation';
import {
  createEditorialRecord,
  deleteEditorialRecord,
  getEditorialRecordById,
  normalizeEditorialTranslations,
  updateEditorialRecord,
} from '@/lib/editorial';
import { slugify } from '@/lib/slug';
import { requireAdminSession } from '@/lib/admin-auth';

function buildTranslations(formData: FormData, existing?: Awaited<ReturnType<typeof getEditorialRecordById>>) {
  return normalizeEditorialTranslations({
    title: { ...existing?.translations.title, zh: formData.get('titleZh'), en: formData.get('titleEn') },
    summary: { ...existing?.translations.summary, zh: formData.get('summaryZh'), en: formData.get('summaryEn') },
    content: { ...existing?.translations.content, zh: formData.get('contentZh'), en: formData.get('contentEn') },
    category: { ...existing?.translations.category, zh: formData.get('categoryZh'), en: formData.get('categoryEn') },
    region: { ...existing?.translations.region, zh: formData.get('regionZh'), en: formData.get('regionEn') },
    product: { ...existing?.translations.product, zh: formData.get('productZh'), en: formData.get('productEn') },
  });
}

async function maybeTranslate(translations: ReturnType<typeof normalizeEditorialTranslations>, enabled: boolean) {
  if (!enabled) return translations;

  try {
    const result = await autoTranslateLocalizedFields([
      { path: 'title', zh: translations.title.zh, en: translations.title.en },
      { path: 'summary', zh: translations.summary.zh, en: translations.summary.en },
      { path: 'content', zh: translations.content.zh, en: translations.content.en },
      { path: 'category', zh: translations.category.zh, en: translations.category.en },
      { path: 'region', zh: translations.region.zh, en: translations.region.en },
      { path: 'product', zh: translations.product.zh, en: translations.product.en },
    ]);

    if (!result.translations) return translations;

    return normalizeEditorialTranslations({
      title: { ...translations.title, ...result.translations.title },
      summary: { ...translations.summary, ...result.translations.summary },
      content: { ...translations.content, ...result.translations.content },
      category: { ...translations.category, ...result.translations.category },
      region: { ...translations.region, ...result.translations.region },
      product: { ...translations.product, ...result.translations.product },
    });
  } catch (error) {
    console.error('Failed to auto-translate case study:', error);
    return translations;
  }
}

export async function createCaseStudy(formData: FormData): Promise<void> {
  await requireAdminSession();

  const id = crypto.randomUUID();
  const titleZh = (formData.get('titleZh') as string) || '';
  const slug = (formData.get('slug') as string)?.trim() || slugify((formData.get('titleEn') as string) || titleZh);
  const published = formData.get('published') === 'on';
  const sortOrder = Number(formData.get('sortOrder') || 0);
  let translations = buildTranslations(formData);
  translations = await maybeTranslate(translations, formData.get('autoTranslate') === 'on');

  await createEditorialRecord(
    'case-study',
    {
      id,
      slug,
      title: titleZh,
      summary: (formData.get('summaryZh') as string) || '',
      content: (formData.get('contentZh') as string) || '',
      category: (formData.get('categoryZh') as string) || '',
      region: (formData.get('regionZh') as string) || '',
      product: (formData.get('productZh') as string) || '',
      coverImageUrl: (formData.get('coverImageUrl') as string) || '',
      tags: ((formData.get('tags') as string) || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      published,
      publishedAt: published ? new Date((formData.get('publishedAt') as string) || Date.now()) : null,
      sortOrder,
    },
    translations
  );

  revalidatePath('/admin/cases');
  for (const locale of publishedLocales) {
    revalidatePath(`/${locale}/cases`);
    revalidatePath(`/${locale}/cases/${slug}`);
  }
  redirect('/admin/cases');
}

export async function updateCaseStudy(caseId: string, formData: FormData): Promise<void> {
  await requireAdminSession();

  const existing = await getEditorialRecordById('case-study', caseId);
  if (!existing) throw new Error('案例不存在');

  const slug =
    (formData.get('slug') as string)?.trim() ||
    slugify((formData.get('titleEn') as string) || (formData.get('titleZh') as string) || existing.title);
  const published = formData.get('published') === 'on';
  const sortOrder = Number(formData.get('sortOrder') || 0);
  let translations = buildTranslations(formData, existing);
  translations = await maybeTranslate(translations, formData.get('autoTranslate') === 'on');

  await updateEditorialRecord(
    'case-study',
    {
      id: caseId,
      slug,
      title: (formData.get('titleZh') as string) || '',
      summary: (formData.get('summaryZh') as string) || '',
      content: (formData.get('contentZh') as string) || '',
      category: (formData.get('categoryZh') as string) || '',
      region: (formData.get('regionZh') as string) || '',
      product: (formData.get('productZh') as string) || '',
      coverImageUrl: (formData.get('coverImageUrl') as string) || '',
      tags: ((formData.get('tags') as string) || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      published,
      publishedAt: published ? new Date((formData.get('publishedAt') as string) || Date.now()) : null,
      sortOrder,
    },
    translations
  );

  revalidatePath('/admin/cases');
  revalidatePath(`/admin/cases/${caseId}/edit`);
  for (const locale of publishedLocales) {
    revalidatePath(`/${locale}/cases`);
    revalidatePath(`/${locale}/cases/${slug}`);
  }
  redirect('/admin/cases');
}

export async function removeCaseStudy(caseId: string) {
  await requireAdminSession();

  await deleteEditorialRecord('case-study', caseId);
  revalidatePath('/admin/cases');
  for (const locale of publishedLocales) {
    revalidatePath(`/${locale}/cases`);
  }
  return { success: true };
}
