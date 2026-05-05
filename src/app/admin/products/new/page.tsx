import React from 'react';
import ProductForm from '@/components/admin/ProductForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { createProduct } from '../actions';

export default async function NewProductPage() {
  await requireAdminSession({ redirectToLogin: true });

  return (
    <ProductForm
      mode="create"
      action={createProduct}
      translationReady={Boolean(process.env.OPENAI_API_KEY)}
    />
  );
}
