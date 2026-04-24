import React from 'react';
import EditorialForm from '@/components/admin/EditorialForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { createCaseStudy } from '../actions';

export default async function NewCaseStudyPage() {
  await requireAdminSession({ redirectToLogin: true });

  return <EditorialForm kind="case-study" mode="create" action={createCaseStudy} backHref="/admin/cases" />;
}
