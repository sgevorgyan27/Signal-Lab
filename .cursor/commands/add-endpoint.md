# /add-endpoint

Use the **signal-lab-nest-endpoint** and **signal-lab-observability** project skills.

Plan and implement a new NestJS API endpoint under `apps/backend/src` for the following requirement:

$ARGUMENTS

Requirements:

- DTO with `class-validator` + Swagger decorators.
- Wire into an appropriate module; keep global prefix `/api` (never put metrics under `/api`).
- If the route changes observable behavior, update `MetricsService` / `ScenarioLogService` and note verification steps (`/metrics`, Loki query, Sentry if applicable).
- Run `npm run build -w backend` and fix any errors.
