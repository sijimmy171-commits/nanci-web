'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/admin-auth';
import { isInquiryStatus, updateInquiryStatus, type InquiryStatus } from '@/lib/inquiries';

function normalizeStatus(value: FormDataEntryValue | null): InquiryStatus {
  if (typeof value !== 'string' || !isInquiryStatus(value)) {
    throw new Error('无效的询盘状态');
  }

  return value;
}

export async function updateInquiryStatusAction(inquiryId: string, formData: FormData) {
  await requireAdminSession();

  const status = normalizeStatus(formData.get('status'));
  await updateInquiryStatus(inquiryId, status);

  revalidatePath('/admin/inquiries');
}
