# Operational Hardening Design

## Scope

This local-only change removes committed administrator credentials, makes inquiry notifications observable and retryable, and makes product persistence atomic. It does not rotate production credentials, change Vercel variables, migrate production data, push Git, or deploy.

## Credentials

The seed script reads `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`. It fails closed when either value is missing or the password is too short. Running the seed updates the selected account password hash so credential rotation is explicit rather than silently skipped.

## Inquiry Notifications

An inquiry is always stored before email is attempted. The notification send is awaited, uses the customer address as `replyTo`, and records `PENDING`, `SENT`, or `FAILED`, the attempt count, timestamp, and a bounded error message. A failed notification does not tell the visitor that the inquiry itself failed. Administrators can retry failed notifications and open a pre-addressed email reply from the inquiry card.

The current runtime schema compatibility pattern is retained for this phase. Formal Prisma migrations remain a separate follow-up because this repository has no migration baseline.

## Product Persistence

Translation generation happens before opening a database transaction. Product base data, category fields, and translation JSON are written in one transaction. If persistence fails after a new signed upload, cleanup is attempted only when the URL belongs to the configured Supabase bucket or the local uploads directory. Replaced images are cleaned up after a successful update.

## Verification

- Unit tests cover mail configuration, inquiry status normalization, and storage URL ownership.
- Existing taxonomy tests remain green.
- ESLint, TypeScript, and the production build pass.
- Browser checks cover the contact form, admin login boundary, and local product pages without sending a real inquiry or mutating production data.
