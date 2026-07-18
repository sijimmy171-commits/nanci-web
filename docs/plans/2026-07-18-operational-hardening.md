# Operational Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Secure administrator seeding, make inquiry email delivery visible and retryable, and make product writes atomic.

**Architecture:** Keep visitor inquiry storage independent from SMTP availability, while persisting notification outcomes for administrators. Perform product database writes through one Prisma transaction and clean up only owned uploads on persistence failure.

**Tech Stack:** Next.js Server Actions, NextAuth, Prisma/PostgreSQL, Nodemailer, Supabase Storage, Node test runner.

---

### Task 1: Secure administrator seed

**Files:**
- Modify: `prisma/seed.ts`

1. Replace the literal email and password with required environment variables.
2. Validate password length before hashing.
3. Update the password hash on an existing account to support intentional rotation.
4. Run lint and the production build without executing the seed.

### Task 2: Track inquiry notification delivery

**Files:**
- Modify: `src/lib/mail.ts`
- Modify: `src/lib/inquiries.ts`
- Modify: `src/app/contact/actions.ts`
- Modify: `src/app/admin/inquiries/actions.ts`
- Modify: `src/app/admin/inquiries/page.tsx`
- Test: `src/lib/inquiry-notifications.test.ts`

1. Add a pure mail configuration validator and tests.
2. Add compatible inquiry notification columns and typed status fields.
3. Await SMTP delivery, set `replyTo`, and return bounded errors.
4. Persist every delivery attempt without failing the visitor's saved inquiry.
5. Add administrator retry and reply controls.
6. Run focused tests and lint.

### Task 3: Make product writes atomic

**Files:**
- Modify: `src/lib/product-content.ts`
- Modify: `src/lib/uploads.ts`
- Modify: `src/app/admin/products/actions.ts`
- Test: `src/lib/uploads.test.ts`

1. Add transaction-client support to category and translation persistence.
2. Build translations before database mutation.
3. Wrap create/update writes in one Prisma transaction.
4. Add owned-upload URL parsing and deletion with tests.
5. Clean new uploads after failed writes and old uploads after successful replacement.
6. Run focused tests, lint, and production build.

### Task 4: Functional verification

1. Run all local tests.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Inspect contact, products, admin login, and inquiry UI in the local browser.
5. Keep all changes uncommitted and wait for user confirmation.
