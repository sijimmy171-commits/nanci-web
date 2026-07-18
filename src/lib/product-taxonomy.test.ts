import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PRODUCT_CATEGORIES,
  getLegacyProductCategory,
  getProductCategories,
  isProductCategoryKey,
  isSurgeProtectionProduct,
} from './product-taxonomy.ts';

test('lists the six product categories in the agreed order', () => {
  assert.deepEqual(
    PRODUCT_CATEGORIES.map((category) => category.key),
    [
      'suspension-disc-insulators',
      'post-insulators',
      'glass-insulators',
      'wall-bushings',
      'transformer-bushings',
      'epoxy-resin-insulators',
    ]
  );
  assert.deepEqual(
    getProductCategories('zh').map((category) => category.label),
    ['悬式绝缘子', '支柱绝缘子', '玻璃绝缘子', '穿墙套管', '变压器套管', '环氧树脂绝缘子']
  );
});

test('validates only public product categories', () => {
  assert.equal(isProductCategoryKey('wall-bushings'), true);
  assert.equal(isProductCategoryKey('surge-arresters'), false);
});

test('maps existing structured and legacy products to the flat taxonomy', () => {
  assert.equal(getLegacyProductCategory({ secondaryCategory: 'post-insulators' }), 'post-insulators');
  assert.equal(getLegacyProductCategory({ category: '瓷穿墙套管' }), 'wall-bushings');
  assert.equal(getLegacyProductCategory({ category: '未知产品' }), null);
});

test('identifies surge protection products for approved deletion', () => {
  assert.equal(isSurgeProtectionProduct({ secondaryCategory: 'surge-arresters' }), true);
  assert.equal(isSurgeProtectionProduct({ category: '避雷器' }), true);
  assert.equal(isSurgeProtectionProduct({ secondaryCategory: 'glass-insulators' }), false);
});
