'use server';

import { revalidatePath } from 'next/cache';
import { createInquiryRecord } from '@/lib/inquiries';
import { sendInquiryNotification } from '@/lib/mail';

export async function createInquiry(formData: FormData) {
  const clientName = (formData.get('clientName') as string)?.trim();
  const clientEmail = (formData.get('clientEmail') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const companyName = (formData.get('companyName') as string)?.trim();
  const productType = (formData.get('productType') as string)?.trim();
  const message = (formData.get('message') as string)?.trim();

  try {
    await createInquiryRecord({
      clientName,
      clientEmail,
      phone,
      companyName,
      productType,
      message,
    });

    sendInquiryNotification({
      name: clientName,
      email: clientEmail,
      phone,
      company: companyName,
      product: productType,
      message,
    }).catch(console.error);

    revalidatePath('/admin/inquiries');
    return { success: true };
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    return { success: false, error: 'Inquiry submission failed. Please try again later.' };
  }
}
