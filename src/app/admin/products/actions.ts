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
  type ProductTranslations,
} from '@/lib/product-content';
import {
  isProductCategoryKey,
  type ProductCategoryKey,
} from '@/lib/product-taxonomy';
import { autoTranslateLocalizedFields } from '@/lib/translation';
import { createSignedUploadTarget, deleteUploadedFile, saveUploadedFile } from '@/lib/uploads';
import { requireAdminSession } from '@/lib/admin-auth';

export type ProductFormState = {
  success: boolean;
  error: string | null;
};

function getSubmittedCategory(formData: FormData): ProductCategoryKey {
  const productCategory = formData.get('productCategory');
  const value = typeof productCategory === 'string' ? productCategory : null;
  if (!isProductCategoryKey(value)) {
    throw new Error('产品分类无效');
  }
  return value;
}

function getText(formData: FormData, name: string, label: string, maxLength: number, required = true) {
  const entry = formData.get(name);
  const value = typeof entry === 'string' ? entry.trim() : '';
  if (required && !value) throw new Error(`${label}不能为空`);
  if (value.length > maxLength) throw new Error(`${label}不能超过 ${maxLength} 个字符`);
  return value;
}

async function buildProductTranslations(input: {
  name: string;
  specs: string;
  nameEn: string;
  specsEn: string;
  shouldAutoTranslate: boolean;
  existing?: ProductTranslations;
}) {
  const empty = createEmptyProductTranslations();
  let translations = normalizeProductTranslations({
    name: { ...(input.existing?.name ?? empty.name), zh: input.name, en: input.nameEn },
    description: input.existing?.description ?? empty.description,
    specs: { ...(input.existing?.specs ?? empty.specs), zh: input.specs, en: input.specsEn },
  });

  if (!input.shouldAutoTranslate) return translations;

  try {
    const result = await autoTranslateLocalizedFields([
      { path: 'name', zh: input.name, en: input.nameEn },
      { path: 'specs', zh: input.specs, en: input.specsEn },
    ]);

    if (result.translations) {
      translations = normalizeProductTranslations({
        ...translations,
        name: { ...translations.name, ...result.translations.name },
        specs: { ...translations.specs, ...result.translations.specs },
      });
    }
  } catch (error) {
    console.error('Failed to auto-translate product content:', error);
  }

  return translations;
}

async function cleanupUploadedImage(imageUrl: string | null | undefined) {
  try {
    await deleteUploadedFile(imageUrl);
  } catch (error) {
    console.error('Failed to clean up uploaded product image:', error);
  }
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

  let uploadedImageUrl: string | null = null;

  try {
    const name = getText(formData, 'name', '产品名称', 200);
    const model = getText(formData, 'model', '产品型号', 200);
    const specs = getText(formData, 'specs', '产品规格', 2000);
    const nameEn = getText(formData, 'nameEn', '英文产品名称', 200, false);
    const specsEn = getText(formData, 'specsEn', '英文产品规格', 2000, false);
    const shouldAutoTranslate = formData.get('autoTranslate') === 'on';
    const imageFile = formData.get('imageFile');
    const submittedImageUrl = formData.get('imageUrl');
    const productCategory = getSubmittedCategory(formData);
    const category = buildLegacyCategoryValue(productCategory);
    await ensureProductColumns();
    const imageUrl = typeof submittedImageUrl === 'string' && submittedImageUrl
      ? submittedImageUrl.trim()
      : await saveUploadedFile({
          file: imageFile instanceof File ? imageFile : null,
          folder: 'products/images',
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
        });
    if (!imageUrl) {
      throw new Error('请上传产品图片');
    }
    uploadedImageUrl = imageUrl;

    const translations = await buildProductTranslations({
      name,
      specs,
      nameEn,
      specsEn,
      shouldAutoTranslate,
    });

    await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.create({
        data: {
          name,
          model,
          category,
          description: '',
          specs,
          imageUrl,
        },
      });
      await saveProductCategoryFields(product.id, productCategory, transaction);
      await saveProductTranslations(product.id, translations, transaction);
    });
    uploadedImageUrl = null;

    revalidatePath('/admin/products');
    revalidatePath('/products');
    for (const locale of publishedLocales) {
      revalidatePath(`/${locale}/products`);
    }
  } catch (error) {
    await cleanupUploadedImage(uploadedImageUrl);
    console.error('Failed to create product:', error);
    return { success: false, error: error instanceof Error ? error.message : '产品创建失败，请稍后重试。' };
  }

  return { success: true, error: null };
}

export async function updateProduct(productId: string, formData: FormData): Promise<ProductFormState> {
  await requireAdminSession();

  let replacementImageUrl: string | null = null;

  try {
    const name = getText(formData, 'name', '产品名称', 200);
    const model = getText(formData, 'model', '产品型号', 200);
    const specs = getText(formData, 'specs', '产品规格', 2000);
    const nameEn = getText(formData, 'nameEn', '英文产品名称', 200, false);
    const specsEn = getText(formData, 'specsEn', '英文产品规格', 2000, false);
    const shouldAutoTranslate = formData.get('autoTranslate') === 'on';
    const submittedImageUrl = formData.get('imageUrl');
    const productCategory = getSubmittedCategory(formData);
    const category = buildLegacyCategoryValue(productCategory);
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
      ? submittedImageUrl.trim()
      : await saveUploadedFile({
          file: imageFile instanceof File ? imageFile : null,
          folder: 'products/images',
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
          fallbackUrl: existingProduct.imageUrl,
        });
    replacementImageUrl = imageUrl && imageUrl !== existingProduct.imageUrl ? imageUrl : null;

    const existingTranslations = await getProductTranslations(productId);
    const translations = await buildProductTranslations({
      name,
      specs,
      nameEn,
      specsEn,
      shouldAutoTranslate,
      existing: existingTranslations,
    });

    await prisma.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id: productId },
        data: {
          name,
          model,
          category,
          specs,
          imageUrl,
        },
      });
      await saveProductCategoryFields(productId, productCategory, transaction);
      await saveProductTranslations(productId, translations, transaction);
    });

    replacementImageUrl = null;
    if (imageUrl && imageUrl !== existingProduct.imageUrl) {
      await cleanupUploadedImage(existingProduct.imageUrl);
    }

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath('/products');
    for (const locale of publishedLocales) {
      revalidatePath(`/${locale}/products`);
    }
  } catch (error) {
    await cleanupUploadedImage(replacementImageUrl);
    console.error('Failed to update product:', error);
    return { success: false, error: error instanceof Error ? error.message : '产品更新失败，请稍后重试。' };
  }

  return { success: true, error: null };
}

export async function deleteProduct(productId: string): Promise<ProductFormState> {
  try {
    await requireAdminSession();

    const product = await prisma.product.delete({
      where: { id: productId },
      select: { imageUrl: true },
    });
    await cleanupUploadedImage(product.imageUrl);

    revalidatePath('/admin/products');
    revalidatePath('/products');
    for (const locale of publishedLocales) {
      revalidatePath(`/${locale}/products`);
    }
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: '产品删除失败，请稍后重试。' };
  }
}
