# Signal Lab — Submission Checklist

Заполни поля **`(указать при сдаче)`** перед отправкой работодателю. Остальное уже привязано к этому репозиторию.

---

## Репозиторий

- **URL**: `(указать при сдаче — git remote или архив)`
- **Ветка**: `(указать при сдаче, напр. main)`
- **Время работы** (приблизительно): `(указать при сдаче)` часов

---

## Запуск

```bash
# Команда запуска:
cp .env.example .env
docker compose up --build

# Команда проверки:
curl -s http://localhost:3001/api/health
curl -s http://localhost:3001/metrics | head
# UI: открыть http://localhost:3000 и прогнать сценарии success / system_error

# Команда остановки:
docker compose down
# с удалением данных Postgres:
docker compose down -v
```

**Предусловия**: Docker Engine + Compose v2; **Node.js 20+** для локальной разработки без контейнеров приложений; для Sentry — переменная **`SENTRY_DSN`** (в `.env` рядом с compose или в `environment` сервиса `backend`).

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | да | `apps/frontend/app/` |
| shadcn/ui | да | `apps/frontend/components/ui/`, `components.json` |
| Tailwind CSS | да | `apps/frontend/app/globals.css`, `postcss.config.mjs` |
| TanStack Query | да | `apps/frontend/app/providers.tsx`, `app/page.tsx` |
| React Hook Form | да | `apps/frontend/app/page.tsx` |
| NestJS | да | `apps/backend/src/` |
| PostgreSQL | да | `docker-compose.yml` -> сервис `postgres` |
| Prisma | да | `prisma/schema.prisma`, миграции в `prisma/migrations/` |
| Sentry | да | `apps/backend/src/main.ts` (`Sentry.init`), `ScenarioService` -> `captureException` |
| Prometheus | да | `docker-compose.yml` -> `prometheus`, `observability/prometheus/prometheus.yml` |
| Grafana | да | `docker-compose.yml` -> `grafana`, provisioning в `observability/grafana/` |
| Loki | да | `docker-compose.yml` -> `loki`, Promtail -> push |

---

## Observability Verification

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| Prometheus metric | В UI запустить **success** (и при желании другие типы). | http://localhost:3001/metrics — серии `scenario_runs_total`, `scenario_run_duration_seconds_*`, `http_requests_total`. |
| Grafana dashboard | После нескольких запусков сценариев открыть дашборд **Signal Lab**. | http://localhost:3002 (admin/admin) или http://localhost:3000/grafana |
| Loki log | Снова запустить сценарий **success** / **slow_request**. | Grafana -> Explore -> Loki, запрос `{compose_service="backend"}`; в строках JSON поля `scenarioType`, `scenarioId`, `duration`. |
| Sentry exception | Задать `SENTRY_DSN`, перезапустить compose, в UI запустить **system_error**. | Проект в Sentry — одно событие на демо-ошибку. |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `signal-lab-observability` | Метрики Prom, JSON-логи (Loki), Sentry для новых/изменённых сценариев и эндпоинтов |
| 2 | `signal-lab-nest-endpoint` | Шаблон Nest: controller/service/DTO/Swagger + связка с observability |
| 3 | `signal-lab-prisma-migration` | Безопасные изменения `schema.prisma`, миграции, сборка backend |

*Отдельно:* оркестратор PRD — `.cursor/skills/signal-lab-orchestrator/` (см. блок **Orchestrator** ниже).

### Commands

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `add-endpoint` | `.cursor/commands/add-endpoint.md` — добавить API с учётом skills observability + Nest |
| 2 | `check-obs` | `.cursor/commands/check-obs.md` — аудит метрик/логов/compose без правок кода |
| 3 | `run-prd-orchestrator` | `.cursor/commands/run-prd-orchestrator.md` — прогон PRD через фазы и subagents |

### Hooks

| # | Hook | Какую проблему решает |
|---|------|----------------------|
| 1 | `postToolUse` -> `node .cursor/hooks/prisma-reminder.mjs` (matcher `Write`) | После записи в репозиторий напоминает про `prisma migrate` / `deploy`, если трогали `prisma/schema.prisma` |
| 2 | `beforeShellExecution` -> `node .cursor/hooks/git-commit-env-guard.mjs` (matcher `git commit`) | Блокирует коммит, если в индексе `.env`, ключи и т.п. |

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `.cursor/rules/stack-constraints.mdc` | Обязательный стек, запрет самовольной замены библиотек |
| 2 | `.cursor/rules/observability-conventions.mdc` | Имена метрик, логи, Sentry в backend |
| 3 | `.cursor/rules/prisma-patterns.mdc` | Prisma только из корня, миграции, без raw SQL по умолчанию |
| 4 | `.cursor/rules/frontend-patterns.mdc` | TanStack Query, RHF, shadcn, `lib/api.ts` |
| 5 | `.cursor/rules/error-handling.mdc` | HttpException, фильтр, поведение фронта |
| 6 | `.cursor/rules/docker-observability-stack.mdc` | Порты Compose, Prometheus/Loki/Grafana |

### Marketplace Skills

Подключи в Cursor (**Settings -> Skills / Marketplace**) шесть навыков из таблицы ниже. Имена в UI могут слегка отличаться — ориентируйся на описание в README.

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | **vercel-react-best-practices** (или **next-best-practices**) | Паттерны Next.js App Router и данных |
| 2 | **shadcn-ui** | Компоненты и практики shadcn |
| 3 | **tailwind-v4-shadcn** (или **tailwind-design-system**) | Tailwind v4 + токены под shadcn |
| 4 | **nestjs-best-practices** | Структура модулей Nest, валидация, Swagger |
| 5 | **prisma-orm** | Схемы, миграции, клиент |
| 6 | **docker-expert** | Compose, сети, sidecar-observability |

### Фактически установленные marketplace skills (заполни при сдаче)

Официальный каталог Cursor чаще показывает SaaS/интеграции; узкие пакеты «Next/Nest/Prisma» могут отсутствовать или называться иначе. По PRD 003 допустим **эквивалентный набор** — главное: **≥6** подключённых навыков/плагинов, **релевантных стеку**, с обоснованием.

**Краткое пояснение для интервьюера (1–3 предложения):**

> В официальном Marketplace по запросам вроде `next` или `typescript` часто попадаются нерелевантные карточки (Convex, Encore и т.д.) или пустая выдача. Я подключил официальные плагины под наш стек и observability: **Prisma**, **Vercel**, **Sentry**, **Grafana Labs**; дополнительно — **Docker Compose** (инфра `docker-compose.yml`, сервисы) и **Tailwind** (стили в `apps/frontend`). Доменные сценарии, метрики `/metrics`, JSON-логи и оркестратор PRD закрывают **project** skills `signal-lab-*` в репозитории, а не marketplace.

**Таблица — фактически установленные (имена как в Cursor; при расхождении поправь первый столбец):**

| # | Название в Cursor / Marketplace | Зачем (связь со стеком) |
|---|-----------------------------------|-------------------------|
| 1 | Prisma | Схема, миграции, Prisma Client в монорепо |
| 2 | Vercel | Next.js и контекст фронта |
| 3 | Sentry | Ошибки; совпадает с `SENTRY_DSN` и `system_error` |
| 4 | Grafana Labs | Grafana / observability (PRD 002) |
| 5 | Docker Compose | Сборка и сеть контейнеров, Compose-файлы |
| 6 | Tailwind | Tailwind CSS на фронте (`apps/frontend`) |
| 7+ | *(опционально)* | |

**Что закрыли custom skills, чего нет в marketplace:**

- Сквозные правила Signal Lab: сценарии `ScenarioRun`, связка **метрика + лог + Sentry** для демо-типов, путь **`/metrics`** без `/api`.
- Монорепо: Prisma в корне + Nest в `apps/backend`.
- **Orchestrator** с `.execution/.../context.json`, фазами PRD и политикой fast/default — это специфика задания, не generic skill.

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/signal-lab-orchestrator/SKILL.md`
- **Путь к context file** (пример): `.execution/2026-04-14-1200/context.json` (см. `.cursor/skills/signal-lab-orchestrator/COORDINATION.md`)
- **Сколько фаз**: 7 (analysis -> codebase -> planning -> decomposition -> implementation -> review -> report)
- **Какие задачи для fast model**: миграции, DTO, простые endpoints, метрики/логи, UI без сложной логики, правки Compose и `.mdc` (см. таблицу в SKILL)
- **Поддерживает resume**: **да** — повторный запуск читает последний `context.json`, не перезапускает `completed` фазы

---

## Скриншоты / видео

- [ ] UI приложения
- [ ] Grafana dashboard с данными
- [ ] Loki logs
- [ ] Sentry error

Файлы в **`docs/screenshots/`** (если подпись не совпадает с картинкой — переставь пути):

- UI: `docs/screenshots/image.png`
- Grafana: `docs/screenshots/image1.png`
- Loki (или Explore в Grafana): `docs/screenshots/image2.png`
- Sentry: `docs/screenshots/image3.png`

---

## Что не успел и что сделал бы первым при +4 часах

`(опционально заполни при сдаче)`

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?
2. Какие задачи подходят для малой модели и почему?
3. Какие marketplace skills подключил, а какие заменил custom — и почему?
4. Какие hooks реально снижают ошибки в повседневной работе?
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?

**Каркас ответов** (разверни устно): skills разбиты по зонам ответственности (obs / API / Prisma / оркестрация); fast — атомарные правки с чётким acceptance; marketplace даёт общие best practices, custom — домен Signal Lab и resume; hooks ловят забытые миграции и утечку секретов в git; оркестратор выносит тяжёлые шаги в subagents и состояние в файл, а не в один промпт.
