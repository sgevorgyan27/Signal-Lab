---
name: signal-lab-prisma-migration
description: >-
  Safely change prisma/schema.prisma, create migrations, and keep Nest/Compose
  workflows in sync for Signal Lab.
---

# Signal Lab — Prisma migration skill

## When to Use

- Editing **`prisma/schema.prisma`** or adding models/fields.
- Fixing drift between database and generated client in Docker or locally.

## Workflow

1. Edit `schema.prisma` with clear field names and optional `Json` for flexible metadata (see `ScenarioRun`).
2. From **repo root**: `npm run prisma:migrate` (dev) — name migrations descriptively when prompted.
3. Run `npm run prisma:generate` if needed (root `postinstall` usually handles it after `npm install`).
4. **Docker** — Rebuild or re-run `prisma migrate deploy` path if the image caches an old client; mounted `prisma/` picks up new SQL, but `node_modules/.prisma` may need regeneration inside the image after dependency changes.
5. Update Nest DTOs/services that map to changed fields; run `npm run build -w backend`.

## When NOT to Use

- One-off data fixes in production — use a dedicated script or SQL with user approval, not blind `db push` without discussion.
