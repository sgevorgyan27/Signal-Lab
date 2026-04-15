---
name: signal-lab-nest-endpoint
description: >-
  Scaffold a NestJS controller route with DTO validation, Swagger decorators,
  Prisma access, and observability hooks aligned with Signal Lab conventions.
---

# Signal Lab — NestJS endpoint skill

## When to Use

- Adding **`POST` / `GET` / `PATCH`** handlers under `apps/backend/src`.
- Creating DTOs with `class-validator` and Swagger (`@ApiProperty`).
- Wiring a new feature module into `AppModule`.

## Workflow

1. **Module layout** — `*.controller.ts`, `*.service.ts`, `dto/*.ts`; import `PrismaModule` is unnecessary (global); import feature module in `AppModule` if new.
2. **DTO** — Use `class-validator` decorators; whitelist via global `ValidationPipe` (already configured). Add Swagger metadata for interview/demo clarity.
3. **Observability** — After a successful or failed domain action, call `MetricsService` and `ScenarioLogService` when the change affects scenario-like flows; otherwise at minimum log at `info` with a stable `context` field.
4. **Errors** — Throw `HttpException` subclasses; do not return ad-hoc `{ error: true }` objects for expected failures.
5. **Tests** — Extend e2e in `apps/backend/test` if the route is user-facing and needs regression protection.

## Checklist

- [ ] Route under global prefix `/api/...` (except `/metrics`)
- [ ] DTO validated
- [ ] Swagger updated
- [ ] Metrics/logs updated if behavior is part of the observability story
