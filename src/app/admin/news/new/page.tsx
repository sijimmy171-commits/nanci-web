import React from 'react';
import EditorialForm from '@/components/admin/EditorialForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { createNewsArticle } from '../actions';

export default async function NewNewsArticlePage() {
  await requireAdminSession({ redirectToLogin: true });

  return <EditorialForm kind="news-article" mode="create" action={createNewsArticle} backHref="/admin/news" />;
}
