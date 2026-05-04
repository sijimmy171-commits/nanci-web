import React from 'react';
import ProductDocumentForm from '@/components/admin/ProductDocumentForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { createProductDocumentFormAction } from '../actions';

export default async function NewProductDocumentPage() {
  await requireAdminSession({ redirectToLogin: true });

  return <ProductDocumentForm mode="create" action={createProductDocumentFormAction} translationReady={Boolean(process.env.OPENAI_API_KEY)} />;
}
