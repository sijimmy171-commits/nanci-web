import React from 'react';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { getProductById, getProductTranslations } from '@/lib/product-content';
import { updateProduct } from '../../actions';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession({ redirectToLogin: true });

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const translations = await getProductTranslations(product.id);
  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <ProductForm
      mode="edit"
      action={updateProductWithId}
      initial={{ ...product, translations }}
      translationReady={Boolean(process.env.OPENAI_API_KEY)}
    />
  );
}
