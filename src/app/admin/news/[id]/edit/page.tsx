import React from 'react';
import { notFound } from 'next/navigation';
import EditorialForm from '@/components/admin/EditorialForm';
import { getEditorialRecordById } from '@/lib/editorial';
import { updateNewsArticle } from '../../actions';

export default async function EditNewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getEditorialRecordById('news-article', id);
  if (!record) notFound();

  const action = updateNewsArticle.bind(null, id);

  return <EditorialForm kind="news-article" mode="edit" action={action} backHref="/admin/news" initial={record} />;
}
