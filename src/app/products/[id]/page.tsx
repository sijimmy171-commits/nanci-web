import { permanentRedirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n';

export default function ProductDetailPage() {
  permanentRedirect(`/${defaultLocale}/products`);
}
