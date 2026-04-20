import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n';

export default async function NewsRedirectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/${defaultLocale}/news/${slug}`);
}
