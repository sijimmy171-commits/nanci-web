/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const existing = await client.query('SELECT id FROM "Product" ORDER BY "createdAt" DESC LIMIT 1');
  if (existing.rows.length > 0) {
    console.log('SKIP_EXISTING_PRODUCT');
    await client.end();
    return;
  }

  await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "contentTranslations" JSONB');

  const insert = await client.query(
    `
      INSERT INTO "Product" (
        id, name, model, category, description, specs, "imageUrl", "catalogUrl", "contentTranslations", "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW(), NOW()
      )
      RETURNING id
    `,
    [
      'demo-product-001',
      '演示复合绝缘子',
      'NC-DEMO-001',
      '复合绝缘子系列',
      '用于验证前台产品详情、图片显示与 PDF 下载链路的演示产品。后续可在后台直接编辑或删除。',
      '额定电压: 35kV\n机械负荷: 10kN\n材质: 硅橡胶 + 玻璃纤维芯棒',
      '/demo-product-image.svg',
      '/demo-product-sheet.pdf',
      JSON.stringify({
        name: {
          zh: '演示复合绝缘子',
          en: 'Demo Composite Insulator',
          es: 'Demo Composite Insulator',
          fr: 'Demo Composite Insulator',
          ar: 'Demo Composite Insulator',
          ru: 'Demo Composite Insulator',
          de: 'Demo Composite Insulator',
          id: 'Demo Composite Insulator',
          vi: 'Demo Composite Insulator',
        },
        description: {
          zh: '用于验证前台产品详情、图片显示与 PDF 下载链路的演示产品。后续可在后台直接编辑或删除。',
          en: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
          es: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
          fr: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
          ar: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
          ru: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
          de: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
          id: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
          vi: 'A demo product used to verify product detail rendering, image display, and PDF download flow. You can edit or delete it later in admin.',
        },
        specs: {
          zh: '额定电压: 35kV\n机械负荷: 10kN\n材质: 硅橡胶 + 玻璃纤维芯棒',
          en: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
          es: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
          fr: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
          ar: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
          ru: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
          de: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
          id: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
          vi: 'Rated Voltage: 35kV\nMechanical Load: 10kN\nMaterial: Silicone rubber + fiberglass core rod',
        },
      }),
    ]
  );

  console.log(`CREATED_DEMO_PRODUCT:${insert.rows[0].id}`);
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
