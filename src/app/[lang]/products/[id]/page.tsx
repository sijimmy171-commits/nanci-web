import { notFound, permanentRedirect } from 'next/navigation';
import { getLocalizedPath, hasLocale } from '@/lib/i18n';

export default async function LocalizedProductDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  permanentRedirect(getLocalizedPath(lang, '/products'));
}
