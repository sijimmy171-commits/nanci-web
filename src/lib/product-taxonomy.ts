import type { Locale } from '@/lib/i18n';

export type ProductPrimaryCategoryKey = 'insulators' | 'bushings' | 'surge-protection';

export type ProductSecondaryCategoryKey =
  | 'suspension-disc-insulators'
  | 'post-insulators'
  | 'glass-insulators'
  | 'epoxy-resin-insulators'
  | 'transformer-bushings'
  | 'wall-bushings'
  | 'surge-arresters';

export type ProductTertiaryCategoryKey = 'porcelain-wall-bushings' | 'composite-dry-wall-bushings';

type LabelMap = Record<'zh' | 'en', string>;

type TertiaryCategoryNode = {
  key: ProductTertiaryCategoryKey;
  label: LabelMap;
};

type SecondaryCategoryNode = {
  key: ProductSecondaryCategoryKey;
  label: LabelMap;
  children?: TertiaryCategoryNode[];
};

type PrimaryCategoryNode = {
  key: ProductPrimaryCategoryKey;
  label: LabelMap;
  children: SecondaryCategoryNode[];
};

export type SpecificCategoryOption = {
  value: string;
  label: string;
  secondaryCategory: ProductSecondaryCategoryKey;
  tertiaryCategory: ProductTertiaryCategoryKey | null;
};

export const PRODUCT_TAXONOMY: PrimaryCategoryNode[] = [
  {
    key: 'insulators',
    label: {
      zh: '绝缘子系列',
      en: 'Insulator Series',
    },
    children: [
      {
        key: 'suspension-disc-insulators',
        label: {
          zh: '悬式及盘形绝缘子',
          en: 'Suspension & Disc Insulators',
        },
      },
      {
        key: 'post-insulators',
        label: {
          zh: '支柱绝缘子',
          en: 'Post Insulators',
        },
      },
      {
        key: 'glass-insulators',
        label: {
          zh: '玻璃绝缘子',
          en: 'Glass Insulators',
        },
      },
      {
        key: 'epoxy-resin-insulators',
        label: {
          zh: '环氧树脂绝缘子',
          en: 'Epoxy Resin Insulators',
        },
      },
    ],
  },
  {
    key: 'bushings',
    label: {
      zh: '套管系列',
      en: 'Bushing Series',
    },
    children: [
      {
        key: 'transformer-bushings',
        label: {
          zh: '变压器套管',
          en: 'Transformer Bushings',
        },
      },
      {
        key: 'wall-bushings',
        label: {
          zh: '穿墙套管',
          en: 'Wall Bushings',
        },
        children: [
          {
            key: 'porcelain-wall-bushings',
            label: {
              zh: '瓷穿墙套管',
              en: 'Porcelain Wall Bushings',
            },
          },
          {
            key: 'composite-dry-wall-bushings',
            label: {
              zh: '复合干式穿墙套管',
              en: 'Composite Dry Wall Bushings',
            },
          },
        ],
      },
    ],
  },
  {
    key: 'surge-protection',
    label: {
      zh: '过电压保护设备',
      en: 'Overvoltage Protection',
    },
    children: [
      {
        key: 'surge-arresters',
        label: {
          zh: '避雷器',
          en: 'Surge Arresters',
        },
      },
    ],
  },
];

type SupportedTaxonomyLocale = 'zh' | 'en';

function resolveTaxonomyLocale(locale: Locale | 'zh' | 'en'): SupportedTaxonomyLocale {
  return locale === 'zh' ? 'zh' : 'en';
}

export function isPrimaryCategoryKey(value: string | null | undefined): value is ProductPrimaryCategoryKey {
  return PRODUCT_TAXONOMY.some((item) => item.key === value);
}

export function isSecondaryCategoryKey(value: string | null | undefined): value is ProductSecondaryCategoryKey {
  return PRODUCT_TAXONOMY.some((item) => item.children.some((child) => child.key === value));
}

export function isTertiaryCategoryKey(value: string | null | undefined): value is ProductTertiaryCategoryKey {
  return PRODUCT_TAXONOMY.some((item) =>
    item.children.some((child) => child.children?.some((grandChild) => grandChild.key === value))
  );
}

export function getPrimaryCategories(locale: Locale | 'zh' | 'en') {
  const targetLocale = resolveTaxonomyLocale(locale);
  return PRODUCT_TAXONOMY.map((item) => ({
    key: item.key,
    label: item.label[targetLocale],
  }));
}

export function getPrimaryCategoryLabel(
  key: ProductPrimaryCategoryKey | null | undefined,
  locale: Locale | 'zh' | 'en'
) {
  if (!key) return '';
  const targetLocale = resolveTaxonomyLocale(locale);
  return PRODUCT_TAXONOMY.find((item) => item.key === key)?.label[targetLocale] ?? '';
}

export function getSecondaryCategories(
  primaryCategory: ProductPrimaryCategoryKey | null | undefined,
  locale: Locale | 'zh' | 'en'
) {
  if (!primaryCategory) return [];
  const targetLocale = resolveTaxonomyLocale(locale);
  const primary = PRODUCT_TAXONOMY.find((item) => item.key === primaryCategory);
  return (
    primary?.children.map((item) => ({
      key: item.key,
      label: item.label[targetLocale],
    })) ?? []
  );
}

export function getSecondaryCategoryLabel(
  primaryCategory: ProductPrimaryCategoryKey | null | undefined,
  secondaryCategory: ProductSecondaryCategoryKey | null | undefined,
  locale: Locale | 'zh' | 'en'
) {
  if (!primaryCategory || !secondaryCategory) return '';
  const targetLocale = resolveTaxonomyLocale(locale);
  return (
    PRODUCT_TAXONOMY.find((item) => item.key === primaryCategory)?.children.find((item) => item.key === secondaryCategory)?.label[
      targetLocale
    ] ?? ''
  );
}

export function getTertiaryCategories(
  primaryCategory: ProductPrimaryCategoryKey | null | undefined,
  secondaryCategory: ProductSecondaryCategoryKey | null | undefined,
  locale: Locale | 'zh' | 'en'
) {
  if (!primaryCategory || !secondaryCategory) return [];
  const targetLocale = resolveTaxonomyLocale(locale);
  const secondary = PRODUCT_TAXONOMY.find((item) => item.key === primaryCategory)?.children.find((item) => item.key === secondaryCategory);
  return (
    secondary?.children?.map((item) => ({
      key: item.key,
      label: item.label[targetLocale],
    })) ?? []
  );
}

export function getTertiaryCategoryLabel(
  primaryCategory: ProductPrimaryCategoryKey | null | undefined,
  secondaryCategory: ProductSecondaryCategoryKey | null | undefined,
  tertiaryCategory: ProductTertiaryCategoryKey | null | undefined,
  locale: Locale | 'zh' | 'en'
) {
  if (!primaryCategory || !secondaryCategory || !tertiaryCategory) return '';
  const targetLocale = resolveTaxonomyLocale(locale);
  return (
    PRODUCT_TAXONOMY.find((item) => item.key === primaryCategory)
      ?.children.find((item) => item.key === secondaryCategory)
      ?.children?.find((item) => item.key === tertiaryCategory)?.label[targetLocale] ?? ''
  );
}

export function getSpecificCategoryOptions(
  primaryCategory: ProductPrimaryCategoryKey | null | undefined,
  locale: Locale | 'zh' | 'en'
): SpecificCategoryOption[] {
  if (!primaryCategory) return [];
  const targetLocale = resolveTaxonomyLocale(locale);
  const primary = PRODUCT_TAXONOMY.find((item) => item.key === primaryCategory);
  if (!primary) return [];

  return primary.children.flatMap<SpecificCategoryOption>((secondary) => {
    if (!secondary.children?.length) {
      return [
        {
          value: serializeSpecificCategory(secondary.key, null),
          label: secondary.label[targetLocale],
          secondaryCategory: secondary.key,
          tertiaryCategory: null,
        },
      ];
    }

    return secondary.children.map((tertiary) => ({
      value: serializeSpecificCategory(secondary.key, tertiary.key),
      label: tertiary.label[targetLocale],
      secondaryCategory: secondary.key,
      tertiaryCategory: tertiary.key,
    }));
  });
}

export function getAllSpecificCategoryOptions(locale: Locale | 'zh' | 'en') {
  return PRODUCT_TAXONOMY.flatMap((primary) =>
    getSpecificCategoryOptions(primary.key, locale).map((option) => ({
      ...option,
      primaryCategory: primary.key,
      primaryLabel: primary.label[resolveTaxonomyLocale(locale)],
      labelWithPrimary: `${primary.label[resolveTaxonomyLocale(locale)]} / ${option.label}`,
    }))
  );
}

export function serializeSpecificCategory(
  secondaryCategory: ProductSecondaryCategoryKey | null | undefined,
  tertiaryCategory: ProductTertiaryCategoryKey | null | undefined
) {
  return tertiaryCategory ? `${secondaryCategory}::${tertiaryCategory}` : secondaryCategory ?? '';
}

export function parseSpecificCategory(
  value: string | null | undefined
): { secondaryCategory: ProductSecondaryCategoryKey | null; tertiaryCategory: ProductTertiaryCategoryKey | null } {
  if (!value) {
    return { secondaryCategory: null, tertiaryCategory: null };
  }

  const [secondaryCategory, tertiaryCategory] = value.split('::');
  return {
    secondaryCategory: isSecondaryCategoryKey(secondaryCategory) ? secondaryCategory : null,
    tertiaryCategory: isTertiaryCategoryKey(tertiaryCategory) ? tertiaryCategory : null,
  };
}

export function getCategoryTrailLabels(
  categories: {
    primaryCategory: ProductPrimaryCategoryKey | null | undefined;
    secondaryCategory?: ProductSecondaryCategoryKey | null | undefined;
    tertiaryCategory?: ProductTertiaryCategoryKey | null | undefined;
  },
  locale: Locale | 'zh' | 'en'
) {
  const trail = [getPrimaryCategoryLabel(categories.primaryCategory, locale)];
  if (categories.secondaryCategory) {
    trail.push(getSecondaryCategoryLabel(categories.primaryCategory ?? null, categories.secondaryCategory, locale));
  }
  if (categories.tertiaryCategory) {
    trail.push(
      getTertiaryCategoryLabel(
        categories.primaryCategory ?? null,
        categories.secondaryCategory ?? null,
        categories.tertiaryCategory,
        locale
      )
    );
  }
  return trail.filter(Boolean);
}

export function getDisplayCategoryLabel(
  categories: {
    primaryCategory: ProductPrimaryCategoryKey | null | undefined;
    secondaryCategory?: ProductSecondaryCategoryKey | null | undefined;
    tertiaryCategory?: ProductTertiaryCategoryKey | null | undefined;
  },
  locale: Locale | 'zh' | 'en'
) {
  const trail = getCategoryTrailLabels(categories, locale);
  return trail[trail.length - 1] ?? '';
}

export function getLegacyCategoryFallback(category: string | null | undefined) {
  const value = category?.trim();
  if (!value) {
    return {
      primaryCategory: null,
      secondaryCategory: null,
      tertiaryCategory: null,
    };
  }

  if (['绝缘子系列', '复合绝缘子系列', '悬式及盘形绝缘子'].includes(value)) {
    return {
      primaryCategory: 'insulators' as const,
      secondaryCategory: 'suspension-disc-insulators' as const,
      tertiaryCategory: null,
    };
  }

  if (['支柱绝缘子'].includes(value)) {
    return {
      primaryCategory: 'insulators' as const,
      secondaryCategory: 'post-insulators' as const,
      tertiaryCategory: null,
    };
  }

  if (['玻璃绝缘子'].includes(value)) {
    return {
      primaryCategory: 'insulators' as const,
      secondaryCategory: 'glass-insulators' as const,
      tertiaryCategory: null,
    };
  }

  if (['环氧树脂绝缘子'].includes(value)) {
    return {
      primaryCategory: 'insulators' as const,
      secondaryCategory: 'epoxy-resin-insulators' as const,
      tertiaryCategory: null,
    };
  }

  if (['套管系列', '变压器套管'].includes(value)) {
    return {
      primaryCategory: 'bushings' as const,
      secondaryCategory: 'transformer-bushings' as const,
      tertiaryCategory: null,
    };
  }

  if (['穿墙套管', '瓷穿墙套管'].includes(value)) {
    return {
      primaryCategory: 'bushings' as const,
      secondaryCategory: 'wall-bushings' as const,
      tertiaryCategory: 'porcelain-wall-bushings' as const,
    };
  }

  if (['复合干式穿墙套管'].includes(value)) {
    return {
      primaryCategory: 'bushings' as const,
      secondaryCategory: 'wall-bushings' as const,
      tertiaryCategory: 'composite-dry-wall-bushings' as const,
    };
  }

  if (['过电压保护设备', '避雷器系列', '避雷器'].includes(value)) {
    return {
      primaryCategory: 'surge-protection' as const,
      secondaryCategory: 'surge-arresters' as const,
      tertiaryCategory: null,
    };
  }

  return {
    primaryCategory: null,
    secondaryCategory: null,
    tertiaryCategory: null,
  };
}
