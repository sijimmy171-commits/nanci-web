import React from 'react';
import ProductDocumentForm from '@/components/admin/ProductDocumentForm';
import { createProductDocumentAction } from '../actions';

export default function NewProductDocumentPage() {
  return <ProductDocumentForm mode="create" action={createProductDocumentAction} />;
}
