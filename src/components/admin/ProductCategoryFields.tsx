'use client';

import { useMemo, useState } from 'react';
import {
  getPrimaryCategories,
  getSecondaryCategories,
  getTertiaryCategories,
  isPrimaryCategoryKey,
  isSecondaryCategoryKey,
  isTertiaryCategoryKey,
  type ProductPrimaryCategoryKey,
  type ProductSecondaryCategoryKey,
  type ProductTertiaryCategoryKey,
} from '@/lib/product-taxonomy';

type ProductCategoryFieldsProps = {
  initialPrimaryCategory?: string | null;
  initialSecondaryCategory?: string | null;
  initialTertiaryCategory?: string | null;
};

export default function ProductCategoryFields({
  initialPrimaryCategory,
  initialSecondaryCategory,
  initialTertiaryCategory,
}: ProductCategoryFieldsProps) {
  const initialPrimary = isPrimaryCategoryKey(initialPrimaryCategory) ? initialPrimaryCategory : 'insulators';
  const [primaryCategory, setPrimaryCategory] = useState<ProductPrimaryCategoryKey>(initialPrimary);
  const [secondaryCategory, setSecondaryCategory] = useState<ProductSecondaryCategoryKey | ''>(
    isSecondaryCategoryKey(initialSecondaryCategory) ? initialSecondaryCategory : ''
  );
  const [tertiaryCategory, setTertiaryCategory] = useState<ProductTertiaryCategoryKey | ''>(
    isTertiaryCategoryKey(initialTertiaryCategory) ? initialTertiaryCategory : ''
  );

  const primaryOptions = useMemo(() => getPrimaryCategories('zh'), []);
  const secondaryOptions = useMemo(() => getSecondaryCategories(primaryCategory, 'zh'), [primaryCategory]);
  const resolvedSecondaryCategory = secondaryOptions.some((item) => item.key === secondaryCategory) ? secondaryCategory : (secondaryOptions[0]?.key ?? '');
  const tertiaryOptions = useMemo(
    () => getTertiaryCategories(primaryCategory, resolvedSecondaryCategory || null, 'zh'),
    [primaryCategory, resolvedSecondaryCategory]
  );
  const resolvedTertiaryCategory = tertiaryOptions.some((item) => item.key === tertiaryCategory) ? tertiaryCategory : (tertiaryOptions[0]?.key ?? '');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-bmw-black uppercase">一级分类 *</label>
          <select
            required
            name="primaryCategory"
            value={primaryCategory}
            onChange={(event) => {
              const nextPrimaryCategory = event.target.value as ProductPrimaryCategoryKey;
              const nextSecondaryOptions = getSecondaryCategories(nextPrimaryCategory, 'zh');
              const nextSecondaryCategory = nextSecondaryOptions[0]?.key ?? '';
              const nextTertiaryOptions = getTertiaryCategories(nextPrimaryCategory, nextSecondaryCategory || null, 'zh');

              setPrimaryCategory(nextPrimaryCategory);
              setSecondaryCategory(nextSecondaryCategory);
              setTertiaryCategory(nextTertiaryOptions[0]?.key ?? '');
            }}
            className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all appearance-none"
          >
            {primaryOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-bmw-black uppercase">具体分类 *</label>
          <select
            required
            name="secondaryCategory"
            value={resolvedSecondaryCategory}
            onChange={(event) => {
              const nextSecondaryCategory = event.target.value as ProductSecondaryCategoryKey;
              const nextTertiaryOptions = getTertiaryCategories(primaryCategory, nextSecondaryCategory, 'zh');

              setSecondaryCategory(nextSecondaryCategory);
              setTertiaryCategory(nextTertiaryOptions[0]?.key ?? '');
            }}
            className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all appearance-none"
          >
            {secondaryOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tertiaryOptions.length > 0 ? (
        <div className="space-y-2">
          <label className="text-xs font-bold text-bmw-black uppercase">细分分类 *</label>
          <select
            required
            name="tertiaryCategory"
            value={resolvedTertiaryCategory}
            onChange={(event) => setTertiaryCategory(event.target.value as ProductTertiaryCategoryKey)}
            className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all appearance-none"
          >
            {tertiaryOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="tertiaryCategory" value="" />
      )}
    </div>
  );
}
