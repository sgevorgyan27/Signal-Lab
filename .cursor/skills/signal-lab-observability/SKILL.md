---
name: signal-lab-observability
description: >-
  Add or extend NestJS API behavior with Prometheus metrics, structured JSON logs
  for Loki, and Sentry reporting consistent with Signal Lab PRD 002.
---

# Signal Lab — Observability skill

## When to Use

- Adding or changing a **NestJS route** that participates in scenario runs or other domain actions.
- Touching **`MetricsService`**, **`ScenarioLogService`**, or Sentry calls.
- Debugging “nothing in Grafana/Loki/Sentry” after a code change.

## Workflow

1. **Metrics** — Prefer extending `MetricsService` with new `Counter` / `Histogram` instances registered on the same `Registry`. Use clear `help` text and stable label names. Observe durations in **seconds** for histograms named `*_seconds`.
2. **Logs** — Use `ScenarioLogService.scenario(level, fields, message)` so every run emits JSON with `scenarioType`, `scenarioId`, `duration`, and `error` when relevant. Keep `context: 'scenario'` via the service implementation.
3. **Sentry** — Call `Sentry.captureException` only for real server faults or deliberate demo errors (e.g. `system_error` path). Use `Sentry.addBreadcrumb` for non-fatal validation-style paths.
4. **Verification** — After changes: `curl -s localhost:3001/metrics | grep your_metric`; trigger a scenario from UI; check Loki with `{compose_service="backend"}`; if `SENTRY_DSN` is set, confirm the event in Sentry.

## Anti-patterns

- Starting a second `Registry` or exposing metrics on `/api/metrics` (scrape path must stay **`/metrics`**).
- Using `console.log` for scenario events instead of the structured logger.
- Swallowing exceptions without logging or metrics updates.
