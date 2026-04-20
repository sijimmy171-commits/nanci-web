# Supabase Storage Uploads Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move uploaded product images, WeChat QR images, inspection report images, and product PDFs from local-only runtime storage to production-safe object storage.

**Architecture:** Keep the current `saveUploadedFile` API so existing admin actions do not need broad rewrites. Add a Supabase Storage adapter inside `src/lib/uploads.ts`; when storage environment variables are configured, upload to Supabase and return a public URL, otherwise preserve the current local `public/uploads` fallback for development.

**Tech Stack:** Next.js 16 App Router Server Actions, native `fetch`, Supabase Storage REST API, existing Prisma URL fields.

---

### Task 1: Add Storage Adapter

**Files:**
- Modify: `src/lib/uploads.ts`

**Steps:**
1. Keep extension validation and folder sanitization.
2. Add environment resolution for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, and optional `SUPABASE_STORAGE_PUBLIC_URL`.
3. If all required storage variables exist, upload bytes with `fetch` to `/storage/v1/object/{bucket}/{path}` using the service role key.
4. Return a stable public object URL.
5. If variables are missing, write to `public/uploads/{folder}` as before.

### Task 2: Document Production Variables

**Files:**
- Modify: `implementation_plan.md`
- Modify: `task.md`

**Steps:**
1. Record Supabase Storage as the selected production resource strategy.
2. Document required environment variables.
3. Mark the resource strategy task complete after verification.

### Task 3: Verify

**Commands:**
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

**Expected:**
- All commands pass.
- Existing upload call sites continue compiling without changes.
