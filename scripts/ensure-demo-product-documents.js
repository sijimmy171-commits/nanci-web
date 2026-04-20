/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "ProductDocument" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "sortOrder" INTEGER DEFAULT 0,
      published BOOLEAN DEFAULT true,
      translations JSONB,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existing = await client.query('SELECT id FROM "ProductDocument" ORDER BY "sortOrder" ASC, "createdAt" DESC LIMIT 1');
  if (existing.rows.length > 0) {
    console.log('SKIP_EXISTING_PRODUCT_DOCUMENT');
    await client.end();
    return;
  }

  await client.query(
    `
      INSERT INTO "ProductDocument" (
        id, title, summary, "fileUrl", "sortOrder", published, translations, "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7::jsonb, NOW(), NOW()
      )
    `,
    [
      'demo-product-document-001',
      '产品总览资料包',
      '汇总产品中心主要系列的演示 PDF，供测试弹窗列表和下载入口使用。',
      '/demo-product-sheet.pdf',
      1,
      true,
      JSON.stringify({
        title: {
          zh: '产品总览资料包',
          en: 'Product Overview Brochure',
          es: 'Product Overview Brochure',
          fr: 'Product Overview Brochure',
          ar: 'Product Overview Brochure',
          ru: 'Product Overview Brochure',
          de: 'Product Overview Brochure',
          id: 'Product Overview Brochure',
          vi: 'Product Overview Brochure',
        },
        summary: {
          zh: '汇总产品中心主要系列的演示 PDF，供测试弹窗列表和下载入口使用。',
          en: 'A demo brochure that represents the shared PDF library for the product center download modal.',
          es: 'A demo brochure that represents the shared PDF library for the product center download modal.',
          fr: 'A demo brochure that represents the shared PDF library for the product center download modal.',
          ar: 'A demo brochure that represents the shared PDF library for the product center download modal.',
          ru: 'A demo brochure that represents the shared PDF library for the product center download modal.',
          de: 'A demo brochure that represents the shared PDF library for the product center download modal.',
          id: 'A demo brochure that represents the shared PDF library for the product center download modal.',
          vi: 'A demo brochure that represents the shared PDF library for the product center download modal.',
        },
      }),
    ]
  );

  console.log('CREATED_DEMO_PRODUCT_DOCUMENT');
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
