import React from 'react';
import { notFound } from 'next/navigation';
import ProductDocumentForm from '@/components/admin/ProductDocumentForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { getProductDocumentById } from '@/lib/product-documents';
import { updateProductDocumentFormAction } from '../../actions';

export default async function EditProductDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession({ redirectToLogin: true });

  const { id } = await params;
  const document = await getProductDocumentById(id);
  if (!document) notFound();

  const action = updateProductDocumentFormAction.bind(null, id);
  return <ProductDocumentForm mode="edit" action={action} initial={document} translationReady={Boolean(process.env.OPENAI_API_KEY)} />;
}
