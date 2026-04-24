import React from 'react';
import { notFound } from 'next/navigation';
import EditorialForm from '@/components/admin/EditorialForm';
import { requireAdminSession } from '@/lib/admin-auth';
import { getEditorialRecordById } from '@/lib/editorial';
import { updateCaseStudy } from '../../actions';

export default async function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession({ redirectToLogin: true });

  const { id } = await params;
  const record = await getEditorialRecordById('case-study', id);
  if (!record) notFound();

  const action = updateCaseStudy.bind(null, id);

  return <EditorialForm kind="case-study" mode="edit" action={action} backHref="/admin/cases" initial={record} />;
}
