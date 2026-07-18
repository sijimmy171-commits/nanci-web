# Product Catalog Simplification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the three-level product taxonomy and product detail flow with six flat categories and non-clickable summary cards, while simplifying admin product uploads and safely migrating existing data.

**Architecture:** Treat the existing `secondaryCategory` database column as the canonical storage for a flat application-level `productCategory`, and centralize the six bilingual categories in `product-taxonomy.ts`. Read legacy category labels only as a migration fallback, then update all frontend filters, navigation, admin forms, sitemap generation, and legacy detail routes to use the flat category model.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Prisma/PostgreSQL, Tailwind CSS, Supabase Storage, Node.js test runner.

---

### Task 1: Define and test the six-category taxonomy

**Files:**
- Modify: `src/lib/product-taxonomy.ts`
- Create: `src/lib/product-taxonomy.test.ts`
- Modify: `package.json`

**Step 1: Write the failing taxonomy tests**

Add Node test cases asserting the exact category key order, Chinese labels, English labels, validation, and legacy secondary-category mappings.

**Step 2: Run the tests and verify failure**

Run: `node --test --experimental-strip-types src/lib/product-taxonomy.test.ts`

Expected: FAIL because the flat `PRODUCT_CATEGORIES`, `ProductCategoryKey`, and mapping helpers do not exist.

**Step 3: Implement the flat taxonomy**

Define these keys in order:

```ts
export type ProductCategoryKey =
  | 'suspension-insulators'
  | 'post-insulators'
  | 'glass-insulators'
  | 'wall-bushings'
  | 'transformer-bushings'
  | 'epoxy-resin-insulators';
```

Expose helpers to list categories, validate keys, resolve labels, and map legacy primary/secondary/tertiary fields. Remove three-level helpers after all consumers are migrated.

**Step 4: Run the taxonomy tests**

Run: `node --test --experimental-strip-types src/lib/product-taxonomy.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add package.json src/lib/product-taxonomy.ts src/lib/product-taxonomy.test.ts
git commit -m "Define six product categories"
```

### Task 2: Normalize canonical category storage and add a safe migration script

**Files:**
- Modify: `src/lib/product-content.ts`
- Create: `scripts/migrate-product-categories.mjs`

**Step 1: Expose `productCategory` in normalized product records**

Derive the application-level `productCategory` from the existing `secondaryCategory` column, with legacy category-label fallback for unmigrated rows.

**Step 2: Update product row normalization**

Validate `secondaryCategory` against the six keys and fall back to legacy labels only while unmigrated rows remain. Update `ProductRecord` and localization helpers accordingly.

**Step 3: Create a dry-run-first migration script**

The script must:

- Load `DATABASE_URL` without printing credentials.
- Read product IDs, names, and old category fields.
- Print counts for each new category.
- Print exact IDs/names marked as surge products.
- Print unmapped records.
- Exit without writes unless `--apply` is present.
- In apply mode, abort if unmapped records exist.
- In one transaction, update mapped rows and delete only records whose structured keys are `surge-arresters` or `surge-protection`.

**Step 4: Generate Prisma and run dry-run**

Run: `npx prisma generate`

Run: `node scripts/migrate-product-categories.mjs`

Expected: category counts, exact surge deletion candidates, and zero unexplained mappings; no rows changed.

**Step 5: Commit**

```bash
git add src/lib/product-content.ts scripts/migrate-product-categories.mjs
git commit -m "Add flat product category migration"
```

### Task 3: Simplify admin product creation and editing

**Files:**
- Modify: `src/components/admin/ProductCategoryFields.tsx`
- Modify: `src/components/admin/ProductForm.tsx`
- Modify: `src/app/admin/products/actions.ts`
- Modify: `src/app/admin/products/page.tsx`

**Step 1: Replace the three category controls**

Render one required `productCategory` select populated from the six-category taxonomy. Preserve the exact agreed category order.

**Step 2: Simplify product fields**

Remove Chinese and English description inputs. Keep Chinese/English name, model, Chinese/English short specs, image upload, and auto-translation. Require an image on create and preserve the existing image on edit.

**Step 3: Update create/update Server Actions**

Validate `productCategory`, save its localized legacy label into `category` for compatibility, save the canonical key into `productCategory`, and stop writing old structured fields. New products use an empty description; edits preserve existing legacy descriptions. Auto-translation handles name and specs only while retaining existing description translations.

**Step 4: Update the admin list**

Replace primary/specific filters with one six-category filter. Replace the external detail icon with a link to `/zh/products?category=<key>`.

**Step 5: Run checks**

Run: `npm run lint`

Run: `npm run build`

Expected: both PASS.

**Step 6: Commit**

```bash
git add src/components/admin/ProductCategoryFields.tsx src/components/admin/ProductForm.tsx src/app/admin/products/actions.ts src/app/admin/products/page.tsx
git commit -m "Simplify admin product categories"
```

### Task 4: Rebuild the product listing around six non-clickable card types

**Files:**
- Modify: `src/app/[lang]/products/page.tsx`
- Modify: `src/app/products/ProductList.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/app/contact/ContactForm.tsx`

**Step 1: Change the product page query contract**

Replace `primary` with `category`, validate it as `ProductCategoryKey`, and pass it as the initial active category.

**Step 2: Simplify ProductList filtering**

Render “All” plus the six categories, remove the specific-category dropdown, and filter by `product.productCategory`. Keep search against name and model.

**Step 3: Simplify cards**

Remove both product detail `Link` elements, descriptions, detail CTA, and chevron. Render image, category badge, product name, model, and a single-line specs value. Keep a stable 1/2/3-column responsive grid.

**Step 4: Update header and mobile menu**

Generate six category links in the confirmed order using `/products?category=<key>`, followed by `/products#documents`. Verify both desktop dropdown and mobile expanded menu use the same data.

**Step 5: Update contact product options**

Use the same six categories for inquiry product type choices.

**Step 6: Run checks**

Run: `npm run lint`

Run: `npm run build`

Expected: both PASS.

**Step 7: Commit**

```bash
git add src/app/[lang]/products/page.tsx src/app/products/ProductList.tsx src/components/Header.tsx src/app/contact/ContactForm.tsx
git commit -m "Simplify product catalog cards"
```

### Task 5: Remove product detail entry points and preserve old URLs

**Files:**
- Modify: `src/app/HomeClient.tsx`
- Modify: `src/app/[lang]/products/[id]/page.tsx`
- Modify: `src/app/products/[id]/page.tsx`
- Modify: `src/app/sitemap.xml/route.ts`

**Step 1: Remove homepage detail links**

Render featured product previews without `/products/{id}` links. Keep the section-level product-center CTA as the route into the catalog.

**Step 2: Redirect localized legacy detail routes**

Use `permanentRedirect(getLocalizedPath(locale, '/products'))` in the localized dynamic route. Use the default locale product center for the unlocalized compatibility route.

**Step 3: Remove product detail sitemap entries**

Delete the dynamic product detail URL loop and its `listProducts` dependency while retaining the localized product-center URL.

**Step 4: Verify redirects and sitemap**

After starting the app, request one old product URL and expect HTTP 308 with a product-center location. Request `/sitemap.xml` and verify no `/products/{id}` entries remain.

**Step 5: Commit**

```bash
git add src/app/HomeClient.tsx src/app/[lang]/products/[id]/page.tsx src/app/products/[id]/page.tsx src/app/sitemap.xml/route.ts
git commit -m "Retire product detail pages"
```

### Task 6: Validate the complete flow and apply production migration

**Files:**
- Modify only if verification reveals defects.

**Step 1: Run all automated checks**

Run: `node --test --experimental-strip-types src/lib/product-taxonomy.test.ts`

Run: `npm run lint`

Run: `npm run build`

Expected: all PASS.

**Step 2: Verify frontend behavior in the browser**

Check `/zh/products` and `/en/products` at desktop and mobile widths. Verify exact category order, category query initialization, search, non-clickable cards, one-line specs, and product document navigation.

**Step 3: Verify admin behavior**

Create a temporary product with an image, edit its category/specs without replacing the image, verify the frontend card, then delete the temporary record. Confirm errors remain visible if upload or save fails.

**Step 4: Re-run migration dry-run against production**

Run: `node scripts/migrate-product-categories.mjs`

Expected: exact six-category counts, explicit surge candidates, and no unmapped rows.

**Step 5: Apply the approved migration**

Run: `node scripts/migrate-product-categories.mjs --apply`

Expected: mapped products updated in one transaction and only approved surge records deleted.

**Step 6: Verify production data after migration**

Re-run dry-run/audit mode and verify no surge or unmapped products remain. Check the public product center and admin product list.

**Step 7: Final commit if verification required fixes**

```bash
git add <verified-files>
git commit -m "Verify six-category product catalog"
```

**Step 8: Push and monitor deployment**

Push the completed branch, wait for Vercel success, then repeat the public product page, old redirect, sitemap, and authenticated admin smoke checks on production.
