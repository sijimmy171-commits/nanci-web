import React from 'react';
import EditorialForm from '@/components/admin/EditorialForm';
import { createNewsArticle } from '../actions';

export default function NewNewsArticlePage() {
  return <EditorialForm kind="news-article" mode="create" action={createNewsArticle} backHref="/admin/news" />;
}
