'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/admin-auth';
import {
  getInquiryById,
  isInquiryStatus,
  recordInquiryNotificationResult,
  updateInquiryStatus,
  type InquiryStatus,
} from '@/lib/inquiries';
import { sendInquiryNotification } from '@/lib/mail';

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

export async function retryInquiryNotificationAction(inquiryId: string) {
  await requireAdminSession();

  const inquiry = await getInquiryById(inquiryId);
  if (!inquiry) {
    throw new Error('询盘不存在');
  }

  const result = await sendInquiryNotification({
    name: inquiry.clientName,
    email: inquiry.clientEmail,
    phone: inquiry.phone,
    company: inquiry.companyName,
    product: inquiry.productType,
    message: inquiry.message,
  });
  await recordInquiryNotificationResult(inquiryId, result);

  revalidatePath('/admin/inquiries');
}
