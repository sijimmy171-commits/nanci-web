import { publishedLocales } from '@/lib/i18n';
import { listProducts } from '@/lib/product-content';
import { listEditorialRecords } from '@/lib/editorial';

const BASE_URL = process.env.SITE_URL || 'https://insulatorschina.com';

export const dynamic = 'force-dynamic';

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

function toXmlEntry(entry: SitemapEntry) {
  let xml = `  <url>\n    <loc>${entry.loc}</loc>\n`;
  if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  if (entry.changefreq) xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
  if (entry.priority !== undefined) xml += `    <priority>${entry.priority}</priority>\n`;
  xml += '  </url>';
  return xml;
}

export async function GET() {
  const entries: SitemapEntry[] = [];
  const now = new Date().toISOString().split('T')[0];

  // Static pages for each published locale
  for (const locale of publishedLocales) {
    entries.push({ loc: `${BASE_URL}/${locale}`, lastmod: now, changefreq: 'weekly', priority: 1.0 });
    entries.push({ loc: `${BASE_URL}/${locale}/about`, lastmod: now, changefreq: 'monthly', priority: 0.8 });
    entries.push({ loc: `${BASE_URL}/${locale}/products`, lastmod: now, changefreq: 'weekly', priority: 0.9 });
    entries.push({ loc: `${BASE_URL}/${locale}/cases`, lastmod: now, changefreq: 'monthly', priority: 0.7 });
    entries.push({ loc: `${BASE_URL}/${locale}/news`, lastmod: now, changefreq: 'weekly', priority: 0.7 });
    entries.push({ loc: `${BASE_URL}/${locale}/contact`, lastmod: now, changefreq: 'monthly', priority: 0.6 });
  }

  // Dynamic product pages
  try {
    const products = await listProducts();
    for (const product of products) {
      for (const locale of publishedLocales) {
        entries.push({
          loc: `${BASE_URL}/${locale}/products/${product.id}`,
          lastmod: product.updatedAt.toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Sitemap: failed to load products', error);
  }

  // Dynamic case study pages
  try {
    const cases = await listEditorialRecords('case-study', true);
    for (const item of cases) {
      for (const locale of publishedLocales) {
        entries.push({
          loc: `${BASE_URL}/${locale}/cases/${encodeURIComponent(item.slug)}`,
          lastmod: item.updatedAt.toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error('Sitemap: failed to load case studies', error);
  }

  // Dynamic news pages
  try {
    const news = await listEditorialRecords('news-article', true);
    for (const item of news) {
      for (const locale of publishedLocales) {
        entries.push({
          loc: `${BASE_URL}/${locale}/news/${encodeURIComponent(item.slug)}`,
          lastmod: item.updatedAt.toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error('Sitemap: failed to load news articles', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(toXmlEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
