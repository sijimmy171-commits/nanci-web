import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/${defaultLocale}/products/${id}`);
}
