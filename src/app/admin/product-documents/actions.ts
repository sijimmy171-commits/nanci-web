'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { publishedLocales } from '@/lib/i18n';
import {
  createEmptyProductDocumentTranslations,
  createProductDocument,
  deleteProductDocument,
  getProductDocumentById,
  normalizeProductDocumentTranslations,
  updateProductDocument,
} from '@/lib/product-documents';
import { autoTranslateLocalizedFields } from '@/lib/translation';
import { saveUploadedFile } from '@/lib/uploads';
import { requireAdminSession } from '@/lib/admin-auth';

function buildTranslations(formData: FormData, existing?: Awaited<ReturnType<typeof getProductDocumentById>>) {
  const defaults = createEmptyProductDocumentTranslations();
  return normalizeProductDocumentTranslations({
    title: {
      ...(existing?.translations.title ?? defaults.title),
      zh: formData.get('titleZh'),
      en: formData.get('titleEn'),
    },
    summary: {
      ...(existing?.translations.summary ?? defaults.summary),
      zh: formData.get('summaryZh'),
      en: formData.get('summaryEn'),
    },
  });
}

async function maybeTranslate(translations: ReturnType<typeof normalizeProductDocumentTranslations>, enabled: boolean) {
  if (!enabled) return translations;

  try {
    const result = await autoTranslateLocalizedFields([
      { path: 'title', zh: translations.title.zh, en: translations.title.en },
      { path: 'summary', zh: translations.summary.zh, en: translations.summary.en },
    ]);

    if (!result.translations) return translations;

    return normalizeProductDocumentTranslations({
      title: { ...translations.title, ...result.translations.title },
      summary: { ...translations.summary, ...result.translations.summary },
    });
  } catch (error) {
    console.error('Failed to auto-translate product document:', error);
    return translations;
  }
}

function revalidateDocumentPages() {
  revalidatePath('/admin/product-documents');
  for (const locale of publishedLocales) {
    revalidatePath(`/${locale}/products`);
  }
}

export async function createProductDocumentAction(formData: FormData): Promise<void> {
  await requireAdminSession();

  const file = formData.get('file');
  const fileUrl = await saveUploadedFile({
    file: file instanceof File ? file : null,
    folder: 'product-documents',
    allowedExtensions: ['.pdf'],
  });

  if (!fileUrl) {
    throw new Error('请上传 PDF 文件');
  }

  let translations = buildTranslations(formData);
  translations = await maybeTranslate(translations, formData.get('autoTranslate') === 'on');

  await createProductDocument(
    {
      id: crypto.randomUUID(),
      title: (formData.get('titleZh') as string) || '',
      summary: (formData.get('summaryZh') as string) || '',
      fileUrl,
      sortOrder: Number(formData.get('sortOrder') || 0),
      published: formData.get('published') === 'on',
    },
    translations
  );

  revalidateDocumentPages();
  redirect('/admin/product-documents');
}

export async function updateProductDocumentAction(documentId: string, formData: FormData): Promise<void> {
  await requireAdminSession();

  const existing = await getProductDocumentById(documentId);
  if (!existing) {
    throw new Error('产品资料不存在');
  }

  const file = formData.get('file');
  const fileUrl = await saveUploadedFile({
    file: file instanceof File ? file : null,
    folder: 'product-documents',
    allowedExtensions: ['.pdf'],
    fallbackUrl: existing.fileUrl,
  });

  let translations = buildTranslations(formData, existing);
  translations = await maybeTranslate(translations, formData.get('autoTranslate') === 'on');

  await updateProductDocument(
    {
      id: documentId,
      title: (formData.get('titleZh') as string) || '',
      summary: (formData.get('summaryZh') as string) || '',
      fileUrl: fileUrl || existing.fileUrl,
      sortOrder: Number(formData.get('sortOrder') || 0),
      published: formData.get('published') === 'on',
    },
    translations
  );

  revalidateDocumentPages();
  redirect('/admin/product-documents');
}

export async function deleteProductDocumentAction(documentId: string) {
  await requireAdminSession();

  await deleteProductDocument(documentId);
  revalidateDocumentPages();
  return { success: true };
}
