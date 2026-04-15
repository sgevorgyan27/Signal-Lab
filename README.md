# Signal Lab

Monorepo (**npm workspaces**): Next.js frontend, NestJS backend, PostgreSQL + Prisma, **Prometheus + Grafana + Loki + Promtail** (PRD 002 observability).

## Prerequisites

- **Node.js 20+** (required by Nest 11 / Next 15 / Tailwind 4)
- **Docker** with Compose v2 (for the all-in-one stack)

## Repository layout

| Path | Role |
|------|------|
| `apps/frontend` | Next.js (App Router), shadcn/ui, Tailwind, TanStack Query, React Hook Form |
| `apps/backend` | NestJS API, Prisma client |
| `prisma/` | Schema and migrations (root-level, per PRD) |
| `observability/` | Prometheus, Grafana, Loki, Promtail configs |
| `.cursor/` | Rules, skills, commands, hooks for Cursor (PRD 003–004) |

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- UI: http://localhost:3000  
- API: http://localhost:3001  
- Swagger: http://localhost:3001/api/docs  
- Health: http://localhost:3001/api/health  
- Metrics: http://localhost:3001/metrics  
- Prometheus: http://localhost:9090  
- Grafana: http://localhost:3002 (login `admin` / `admin`; dashboard **Signal Lab**)  
- Grafana via UI proxy: http://localhost:3000/grafana  
- Loki: http://localhost:3100  

**Sentry:** set `SENTRY_DSN` (e.g. in `.env` next to `docker compose`, or export before `docker compose up`) to capture `system_error` scenarios.

### PRD 002 verification (manual)

1. `docker compose up --build`
2. Open http://localhost:3000 — run **success**, then **system_error** (expect error toast; row in history).
3. Open http://localhost:3001/metrics — confirm `scenario_runs_total` and `scenario_run_duration_seconds_*`.
4. Grafana → **Signal Lab** dashboard — rates move after a few runs.
5. Grafana → Explore → Loki — query `{compose_service="backend"}` — JSON lines include `scenarioType`, `scenarioId`, `duration`.
6. Sentry — one event per **system_error** when `SENTRY_DSN` is set.

Source hot reload: backend mounts `apps/backend/src` and `prisma/`; frontend mounts `app/`, `components/`, `lib/`, `public/`, `next.config.ts`. Rebuild after **dependency** or **Prisma client** changes: `docker compose up --build`.

## Local dev (host Node)

1. Start Postgres only (or use your own URL):

   ```bash
   docker compose up -d postgres
   ```

2. Install and migrate:

   ```bash
   cp .env.example .env
   npm install
   npm run prisma:migrate
   ```

3. Run apps (two terminals):

   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run dev:backend` | Nest watch mode on port 3001 |
| `npm run dev:frontend` | Next dev on port 3000 |
| `npm run prisma:migrate` | Create/apply migrations (dev) |
| `npm run prisma:deploy` | Apply migrations (CI / prod-like) |
| `npm run build -w backend` | Backend compile check |
| `npm run build -w frontend` | Frontend production build |

## Stop / reset Docker

```bash
docker compose down        # stop containers
docker compose down -v     # also remove Postgres volume
```

## Cursor AI layer (PRD 003–004)

Project artifacts live under **`.cursor/`** so a **new chat** can continue without re-explaining the stack.

| Path | Purpose |
|------|---------|
| `.cursor/rules/*.mdc` | Stack guardrails, observability naming, Prisma/frontend patterns, errors, Compose |
| `.cursor/skills/signal-lab-observability` | How to add metrics/logs/Sentry consistently |
| `.cursor/skills/signal-lab-nest-endpoint` | Scaffold Nest routes + DTOs + Swagger |
| `.cursor/skills/signal-lab-prisma-migration` | Schema/migration workflow |
| `.cursor/skills/signal-lab-orchestrator` | Multi-phase PRD runner + `COORDINATION.md` (`context.json` schema) |
| `.cursor/commands/` | Slash-style prompts: `add-endpoint`, `check-obs`, `run-prd-orchestrator` |
| `.cursor/hooks.json` | **postToolUse** (Prisma reminder), **beforeShellExecution** (block `.env` in `git commit`) |

**Commands:** in Cursor, use the project commands (or paste the markdown body from `.cursor/commands/*.md` into chat).

**Hooks:** require **Node** on `PATH` (repo already uses Node20+). Reload Cursor after editing `hooks.json`.

### Marketplace skills (PRD 003)

**Project** skills (`signal-lab-*` in `.cursor/skills/`) уже в репозитории. **Marketplace** skills ставятся в Cursor вручную ([Marketplace](https://cursor.com/marketplace)); зафиксируй точные названия у себя в **`SUBMISSION_CHECKLIST.md`**.

Ниже — **что подключить** (по смыслу, имена в UI могут отличаться) и **зачем**:

| Marketplace skill | Why it is connected |
|-------------------|---------------------|
| **vercel-react-best-practices** (or **next-best-practices**) | Next.js App Router, RSC boundaries, data fetching patterns |
| **shadcn-ui** | Components, theming, forms aligned with the UI stack |
| **tailwind-v4-shadcn** (or **tailwind-design-system**) | Tailwind v4 + design tokens used by the template |
| **nestjs-best-practices** | Modules, DI, validation, structure for `apps/backend` |
| **prisma-orm** | Schema design, migrations, client usage |
| **docker-expert** | Compose, volumes, healthchecks, observability sidecars |

**Gap filled by custom skills:** end-to-end Signal Lab scenario/metrics/log/Sentry conventions, Prisma-in-monorepo steps, and the **orchestrator + `context.json` resume** flow are **not** in generic marketplace packs.

## Assignment docs

See `ASSIGNMENT.md`, `prds/`, `RUBRIC.md`, and `SUBMISSION_CHECKLIST.md`.
