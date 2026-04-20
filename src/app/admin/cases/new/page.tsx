import React from 'react';
import EditorialForm from '@/components/admin/EditorialForm';
import { createCaseStudy } from '../actions';

export default function NewCaseStudyPage() {
  return <EditorialForm kind="case-study" mode="create" action={createCaseStudy} backHref="/admin/cases" />;
}
