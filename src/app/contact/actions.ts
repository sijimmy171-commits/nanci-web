'use server';

import { revalidatePath } from 'next/cache';
import { createInquiryRecord, recordInquiryNotificationResult } from '@/lib/inquiries';
import { sendInquiryNotification } from '@/lib/mail';

// Simple in-memory rate limiting (per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 submissions per minute per IP-like key

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Clean up stale entries periodically
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  };
  setInterval(cleanup, 60_000).unref?.();
}

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 50;
const MAX_COMPANY_LENGTH = 200;
const MAX_PRODUCT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInquiryInput(formData: FormData) {
  const clientName = (formData.get('clientName') as string)?.trim() || '';
  const clientEmail = (formData.get('clientEmail') as string)?.trim() || '';
  const phone = (formData.get('phone') as string)?.trim() || '';
  const companyName = (formData.get('companyName') as string)?.trim() || '';
  const productType = (formData.get('productType') as string)?.trim() || '';
  const message = (formData.get('message') as string)?.trim() || '';

  if (!clientName || clientName.length > MAX_NAME_LENGTH) {
    return { valid: false as const, error: 'Name is required and must be under 200 characters.' };
  }

  if (!clientEmail || !EMAIL_REGEX.test(clientEmail) || clientEmail.length > MAX_EMAIL_LENGTH) {
    return { valid: false as const, error: 'A valid email address is required.' };
  }

  if (phone.length > MAX_PHONE_LENGTH) {
    return { valid: false as const, error: 'Phone number is too long.' };
  }

  if (companyName.length > MAX_COMPANY_LENGTH) {
    return { valid: false as const, error: 'Company name is too long.' };
  }

  if (productType.length > MAX_PRODUCT_LENGTH) {
    return { valid: false as const, error: 'Product type is too long.' };
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false as const, error: `Message is required and must be under ${MAX_MESSAGE_LENGTH} characters.` };
  }

  return {
    valid: true as const,
    data: { clientName, clientEmail, phone, companyName, productType, message },
  };
}

export async function createInquiry(formData: FormData) {
  // Rate limiting using email as key (best effort in serverless)
  const email = (formData.get('clientEmail') as string)?.trim() || 'unknown';
  if (!checkRateLimit(email)) {
    return { success: false, error: 'Too many submissions. Please try again later.' };
  }

  const validation = validateInquiryInput(formData);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const { clientName, clientEmail, phone, companyName, productType, message } = validation.data;

  let inquiryId: string;
  try {
    inquiryId = await createInquiryRecord({
      clientName,
      clientEmail,
      phone,
      companyName,
      productType,
      message,
    });

  } catch (error) {
    console.error('Failed to create inquiry:', error);
    return { success: false, error: 'Inquiry submission failed. Please try again later.' };
  }

  try {
    const notificationResult = await sendInquiryNotification({
      name: clientName,
      email: clientEmail,
      phone,
      company: companyName,
      product: productType,
      message,
    });
    await recordInquiryNotificationResult(inquiryId, notificationResult);
  } catch (error) {
    console.error('Failed to record inquiry notification result:', error);
  }

  try {
    revalidatePath('/admin/inquiries');
  } catch (error) {
    console.error('Failed to revalidate inquiry admin page:', error);
  }

  return { success: true };
}
