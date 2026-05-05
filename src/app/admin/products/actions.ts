'use server';

import { revalidatePath } from 'next/cache';
import { publishedLocales } from '@/lib/i18n';
import { prisma } from '@/lib/prisma';
import {
  buildLegacyCategoryValue,
  createEmptyProductTranslations,
  ensureProductColumns,
  getProductTranslations,
  normalizeProductTranslations,
  saveProductCategoryFields,
  saveProductTranslations,
} from '@/lib/product-content';
import {
  isPrimaryCategoryKey,
  isSecondaryCategoryKey,
  isTertiaryCategoryKey,
  type ProductPrimaryCategoryKey,
  type ProductSecondaryCategoryKey,
  type ProductTertiaryCategoryKey,
} from '@/lib/product-taxonomy';
import { autoTranslateLocalizedFields } from '@/lib/translation';
import { createSignedUploadTarget, saveUploadedFile } from '@/lib/uploads';
import { requireAdminSession } from '@/lib/admin-auth';

export type ProductFormState = {
  success: boolean;
  error: string | null;
};

function getSubmittedCategories(formData: FormData): {
  primaryCategory: ProductPrimaryCategoryKey;
  secondaryCategory: ProductSecondaryCategoryKey;
  tertiaryCategory: ProductTertiaryCategoryKey | null;
} {
  const primaryCategory = formData.get('primaryCategory');
  const secondaryCategory = formData.get('secondaryCategory');
  const tertiaryCategory = formData.get('tertiaryCategory');
  const primaryCategoryValue = typeof primaryCategory === 'string' ? primaryCategory : null;
  const secondaryCategoryValue = typeof secondaryCategory === 'string' ? secondaryCategory : null;
  const tertiaryCategoryValue = typeof tertiaryCategory === 'string' ? tertiaryCategory : null;

  if (!isPrimaryCategoryKey(primaryCategoryValue)) {
    throw new Error('产品一级分类无效');
  }

  if (!isSecondaryCategoryKey(secondaryCategoryValue)) {
    throw new Error('产品具体分类无效');
  }

  return {
    primaryCategory: primaryCategoryValue,
    secondaryCategory: secondaryCategoryValue,
    tertiaryCategory: isTertiaryCategoryKey(tertiaryCategoryValue) ? tertiaryCategoryValue : null,
  };
}

export async function createProductImageUploadTargetAction(input: {
  filename: string;
  contentType: string;
  size: number;
}) {
  await requireAdminSession();

  return createSignedUploadTarget({
    filename: input.filename,
    contentType: input.contentType,
    size: input.size,
    folder: 'products/images',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  });
}

export async function createProduct(formData: FormData): Promise<ProductFormState> {
  await requireAdminSession();

  const name = formData.get('name') as string;
  const model = formData.get('model') as string;
  const categories = getSubmittedCategories(formData);
  const category = buildLegacyCategoryValue(categories);
  const description = formData.get('description') as string;
  const specs = formData.get('specs') as string;
  const nameEn = formData.get('nameEn') as string;
  const descriptionEn = formData.get('descriptionEn') as string;
  const specsEn = formData.get('specsEn') as string;
  const shouldAutoTranslate = formData.get('autoTranslate') === 'on';
  const imageFile = formData.get('imageFile');
  const submittedImageUrl = formData.get('imageUrl');

  try {
    await ensureProductColumns();
    const imageUrl = typeof submittedImageUrl === 'string' && submittedImageUrl
      ? submittedImageUrl
      : await saveUploadedFile({
          file: imageFile instanceof File ? imageFile : null,
          folder: 'products/images',
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
        });

    const product = await prisma.product.create({
      data: {
        name,
        model,
        category,
        description,
        specs,
        imageUrl,
      },
    });

    await saveProductCategoryFields(product.id, categories);

    let translations = normalizeProductTranslations({
      name: { ...createEmptyProductTranslations().name, zh: name, en: nameEn },
      description: { ...createEmptyProductTranslations().description, zh: description, en: descriptionEn },
      specs: { ...createEmptyProductTranslations().specs, zh: specs, en: specsEn },
    });

    if (shouldAutoTranslate) {
      try {
        const result = await autoTranslateLocalizedFields([
          { path: 'name', zh: name, en: nameEn },
          { path: 'description', zh: description, en: descriptionEn },
          { path: 'specs', zh: specs, en: specsEn },
        ]);

        if (result.translations) {
          translations = normalizeProductTranslations({
            ...translations,
            name: { ...translations.name, ...result.translations.name },
            description: { ...translations.description, ...result.translations.description },
            specs: { ...translations.specs, ...result.translations.specs },
          });
        }
      } catch (error) {
        console.error('Failed to auto-translate product content:', error);
      }
    }

    await saveProductTranslations(product.id, translations);

    revalidatePath('/admin/products');
    revalidatePath('/products');
    for (const locale of publishedLocales) {
      revalidatePath(`/${locale}/products`);
      revalidatePath(`/${locale}/products/${product.id}`);
    }
  } catch (error) {
    console.error('Failed to create product:', error);
    return { success: false, error: error instanceof Error ? error.message : '产品创建失败，请稍后重试。' };
  }

  return { success: true, error: null };
}

export async function updateProduct(productId: string, formData: FormData): Promise<ProductFormState> {
  await requireAdminSession();

  const name = formData.get('name') as string;
  const model = formData.get('model') as string;
  const categories = getSubmittedCategories(formData);
  const category = buildLegacyCategoryValue(categories);
  const description = formData.get('description') as string;
  const specs = formData.get('specs') as string;
  const nameEn = formData.get('nameEn') as string;
  const descriptionEn = formData.get('descriptionEn') as string;
  const specsEn = formData.get('specsEn') as string;
  const shouldAutoTranslate = formData.get('autoTranslate') === 'on';
  const submittedImageUrl = formData.get('imageUrl');

  try {
    await ensureProductColumns();
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { imageUrl: true },
    });

    if (!existingProduct) {
      throw new Error('产品不存在');
    }

    const imageFile = formData.get('imageFile');
    const imageUrl = typeof submittedImageUrl === 'string' && submittedImageUrl
      ? submittedImageUrl
      : await saveUploadedFile({
          file: imageFile instanceof File ? imageFile : null,
          folder: 'products/images',
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
          fallbackUrl: existingProduct.imageUrl,
        });

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        model,
        category,
        description,
        specs,
        imageUrl,
      },
    });

    await saveProductCategoryFields(productId, categories);

    const existingTranslations = await getProductTranslations(productId);
    let translations = normalizeProductTranslations({
      name: { ...existingTranslations.name, zh: name, en: nameEn },
      description: { ...existingTranslations.description, zh: description, en: descriptionEn },
      specs: { ...existingTranslations.specs, zh: specs, en: specsEn },
    });

    if (shouldAutoTranslate) {
      try {
        const result = await autoTranslateLocalizedFields([
          { path: 'name', zh: name, en: nameEn },
          { path: 'description', zh: description, en: descriptionEn },
          { path: 'specs', zh: specs, en: specsEn },
        ]);

        if (result.translations) {
          translations = normalizeProductTranslations({
            ...translations,
            name: { ...translations.name, ...result.translations.name },
            description: { ...translations.description, ...result.translations.description },
            specs: { ...translations.specs, ...result.translations.specs },
          });
        }
      } catch (error) {
        console.error('Failed to auto-translate product content:', error);
      }
    }

    await saveProductTranslations(productId, translations);

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath('/products');
    revalidatePath(`/products/${productId}`);
    for (const locale of publishedLocales) {
      revalidatePath(`/${locale}/products`);
      revalidatePath(`/${locale}/products/${productId}`);
    }
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, error: error instanceof Error ? error.message : '产品更新失败，请稍后重试。' };
  }

  return { success: true, error: null };
}

export async function deleteProduct(productId: string): Promise<ProductFormState> {
  try {
    await requireAdminSession();

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');
    for (const locale of publishedLocales) {
      revalidatePath(`/${locale}/products`);
      revalidatePath(`/${locale}/products/${productId}`);
    }
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: '产品删除失败，请稍后重试。' };
  }
}
