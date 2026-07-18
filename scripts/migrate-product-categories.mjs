import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
const applyChanges = process.argv.includes('--apply');

const validCategories = new Set([
  'suspension-disc-insulators',
  'post-insulators',
  'glass-insulators',
  'wall-bushings',
  'transformer-bushings',
  'epoxy-resin-insulators',
]);

const legacyLabels = new Map([
  ['绝缘子系列', 'suspension-disc-insulators'],
  ['复合绝缘子系列', 'suspension-disc-insulators'],
  ['悬式及盘形绝缘子', 'suspension-disc-insulators'],
  ['悬式绝缘子', 'suspension-disc-insulators'],
  ['支柱绝缘子', 'post-insulators'],
  ['玻璃绝缘子', 'glass-insulators'],
  ['环氧树脂绝缘子', 'epoxy-resin-insulators'],
  ['套管系列', 'transformer-bushings'],
  ['变压器套管', 'transformer-bushings'],
  ['穿墙套管', 'wall-bushings'],
  ['瓷穿墙套管', 'wall-bushings'],
  ['复合干式穿墙套管', 'wall-bushings'],
]);

const categoryLabels = new Map([
  ['suspension-disc-insulators', '悬式绝缘子'],
  ['post-insulators', '支柱绝缘子'],
  ['glass-insulators', '玻璃绝缘子'],
  ['wall-bushings', '穿墙套管'],
  ['transformer-bushings', '变压器套管'],
  ['epoxy-resin-insulators', '环氧树脂绝缘子'],
]);

function isSurgeProduct(product) {
  return product.primaryCategory === 'surge-protection'
    || product.secondaryCategory === 'surge-arresters'
    || ['过电压保护设备', '避雷器系列', '避雷器'].includes(product.category?.trim());
}

function resolveCategory(product) {
  if (validCategories.has(product.secondaryCategory)) return product.secondaryCategory;
  return legacyLabels.get(product.category?.trim()) ?? null;
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const { rows } = await client.query(`
    SELECT id, name, category,
      "primaryCategory" AS "primaryCategory",
      "secondaryCategory" AS "secondaryCategory",
      "tertiaryCategory" AS "tertiaryCategory"
    FROM "Product"
    ORDER BY name
  `);

  const surgeProducts = rows.filter(isSurgeProduct);
  const retainedProducts = rows.filter((product) => !isSurgeProduct(product));
  const mappedProducts = retainedProducts.map((product) => ({ ...product, nextCategory: resolveCategory(product) }));
  const unmappedProducts = mappedProducts.filter((product) => !product.nextCategory);
  const counts = Object.fromEntries([...validCategories].map((key) => [key, 0]));

  for (const product of mappedProducts) {
    if (product.nextCategory) counts[product.nextCategory] += 1;
  }

  console.log(JSON.stringify({
    mode: applyChanges ? 'apply' : 'dry-run',
    categoryCounts: counts,
    surgeProducts: surgeProducts.map(({ id, name, category }) => ({ id, name, category })),
    unmappedProducts: unmappedProducts.map(({ id, name, category }) => ({ id, name, category })),
  }, null, 2));

  if (!applyChanges) {
    console.log('Dry run complete. No database rows were changed.');
  } else {
    if (unmappedProducts.length > 0) {
      throw new Error('Migration aborted because unmapped products remain.');
    }

    await client.query('BEGIN');
    try {
      for (const product of mappedProducts) {
        const primaryCategory = ['wall-bushings', 'transformer-bushings'].includes(product.nextCategory)
          ? 'bushings'
          : 'insulators';
        await client.query(
          `UPDATE "Product"
           SET category = $1, "primaryCategory" = $2, "secondaryCategory" = $3, "tertiaryCategory" = NULL
           WHERE id = $4`,
          [categoryLabels.get(product.nextCategory), primaryCategory, product.nextCategory, product.id]
        );
      }

      if (surgeProducts.length > 0) {
        await client.query('DELETE FROM "Product" WHERE id = ANY($1::text[])', [surgeProducts.map((product) => product.id)]);
      }

      await client.query('COMMIT');
      console.log(`Applied migration and deleted ${surgeProducts.length} approved surge product(s).`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
} finally {
  await client.end();
}
