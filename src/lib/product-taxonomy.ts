import type { Locale } from '@/lib/i18n';

export type ProductCategoryKey =
  | 'suspension-disc-insulators'
  | 'post-insulators'
  | 'glass-insulators'
  | 'wall-bushings'
  | 'transformer-bushings'
  | 'epoxy-resin-insulators';

type ProductCategory = {
  key: ProductCategoryKey;
  label: Record<'zh' | 'en', string>;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    key: 'suspension-disc-insulators',
    label: { zh: '悬式绝缘子', en: 'Suspension Insulators' },
  },
  {
    key: 'post-insulators',
    label: { zh: '支柱绝缘子', en: 'Post Insulators' },
  },
  {
    key: 'glass-insulators',
    label: { zh: '玻璃绝缘子', en: 'Glass Insulators' },
  },
  {
    key: 'wall-bushings',
    label: { zh: '穿墙套管', en: 'Wall Bushings' },
  },
  {
    key: 'transformer-bushings',
    label: { zh: '变压器套管', en: 'Transformer Bushings' },
  },
  {
    key: 'epoxy-resin-insulators',
    label: { zh: '环氧树脂绝缘子', en: 'Epoxy Resin Insulators' },
  },
];

function resolveTaxonomyLocale(locale: Locale | 'zh' | 'en') {
  return locale === 'zh' ? 'zh' : 'en';
}

export function isProductCategoryKey(value: string | null | undefined): value is ProductCategoryKey {
  return PRODUCT_CATEGORIES.some((category) => category.key === value);
}

export function getProductCategories(locale: Locale | 'zh' | 'en') {
  const targetLocale = resolveTaxonomyLocale(locale);
  return PRODUCT_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label[targetLocale],
  }));
}

export function getProductCategoryLabel(
  key: ProductCategoryKey | null | undefined,
  locale: Locale | 'zh' | 'en'
) {
  if (!key) return '';
  const targetLocale = resolveTaxonomyLocale(locale);
  return PRODUCT_CATEGORIES.find((category) => category.key === key)?.label[targetLocale] ?? '';
}

export function getLegacyProductCategory(input: {
  category?: string | null;
  primaryCategory?: string | null;
  secondaryCategory?: string | null;
  tertiaryCategory?: string | null;
}): ProductCategoryKey | null {
  if (isProductCategoryKey(input.secondaryCategory)) {
    return input.secondaryCategory;
  }

  const value = input.category?.trim();
  if (!value) return null;

  const labelMap: Record<string, ProductCategoryKey> = {
    绝缘子系列: 'suspension-disc-insulators',
    复合绝缘子系列: 'suspension-disc-insulators',
    悬式及盘形绝缘子: 'suspension-disc-insulators',
    悬式绝缘子: 'suspension-disc-insulators',
    支柱绝缘子: 'post-insulators',
    玻璃绝缘子: 'glass-insulators',
    环氧树脂绝缘子: 'epoxy-resin-insulators',
    套管系列: 'transformer-bushings',
    变压器套管: 'transformer-bushings',
    穿墙套管: 'wall-bushings',
    瓷穿墙套管: 'wall-bushings',
    复合干式穿墙套管: 'wall-bushings',
  };

  return labelMap[value] ?? null;
}

export function isSurgeProtectionProduct(input: {
  category?: string | null;
  primaryCategory?: string | null;
  secondaryCategory?: string | null;
}) {
  if (input.primaryCategory === 'surge-protection' || input.secondaryCategory === 'surge-arresters') {
    return true;
  }

  return ['过电压保护设备', '避雷器系列', '避雷器'].includes(input.category?.trim() ?? '');
}
