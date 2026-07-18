'use client';

import { getProductCategories, isProductCategoryKey } from '@/lib/product-taxonomy';

type ProductCategoryFieldsProps = {
  initialProductCategory?: string | null;
};

export default function ProductCategoryFields({ initialProductCategory }: ProductCategoryFieldsProps) {
  const categories = getProductCategories('zh');
  const defaultValue = isProductCategoryKey(initialProductCategory)
    ? initialProductCategory
    : categories[0]?.key;

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-bmw-black uppercase">产品分类 *</label>
      <select
        required
        name="productCategory"
        defaultValue={defaultValue}
        className="w-full bg-bmw-lightgray border border-gray-200 p-4 text-sm focus:outline-none focus:border-bmw-blue transition-all appearance-none"
      >
        {categories.map((category) => (
          <option key={category.key} value={category.key}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
