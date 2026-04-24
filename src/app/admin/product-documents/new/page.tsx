import React from 'react';
import ProductDocumentForm from '@/components/admin/ProductDocumentForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { createProductDocumentAction } from '../actions';

export default async function NewProductDocumentPage() {
  await requireAdminSession({ redirectToLogin: true });

  return <ProductDocumentForm mode="create" action={createProductDocumentAction} />;
}
