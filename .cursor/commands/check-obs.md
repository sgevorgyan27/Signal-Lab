# /check-obs

Audit Signal Lab observability for drift after recent edits.

$ARGUMENTS

Do the following **read-only** pass, then list gaps and minimal fixes:

1. Confirm `GET /metrics` exposes `scenario_runs_total`, `scenario_run_duration_seconds`, `http_requests_total` (grep backend `MetricsService`).
2. Confirm scenario paths log via `ScenarioLogService` with `scenarioType`, `scenarioId`, `duration`.
3. Confirm `docker-compose.yml` still wires Prometheus → `backend:3001`, Grafana datasources, Promtail → Loki.
4. Confirm README verification steps still match ports and paths.

Output: short checklist table **OK / FIX** with file paths.
