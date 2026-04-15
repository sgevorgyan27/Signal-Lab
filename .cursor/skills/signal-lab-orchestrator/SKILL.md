---
name: signal-lab-orchestrator
description: >-
  Run a Signal Lab PRD through phased decomposition: analysis, scan, plan,
  tasks, implementation, review, report — with context in .execution/context.json
  and heavy work delegated to subagents (fast vs default models).
---

# Signal Lab — PRD orchestrator

## When to Use

- User pastes a PRD path (e.g. `prds/002_prd-observability-demo.md`) or asks to “implement the next PRD”.
- Large change that must be **resumable** after disconnects and **cheap in main chat** (delegate to Task tool / subagents).

## When NOT to Use

- Single-file typos or one obvious bug — fix directly without phases.

## Setup

1. Create **`.execution/<timestamp>/`** at repo root (`timestamp` = `YYYY-MM-DD-HHmm` UTC or local).
2. Write **`.execution/<timestamp>/context.json`** — see schema in `COORDINATION.md`.
3. Set `status: "in_progress"` and `currentPhase` to the active phase.

## Phases (order)

| # | Phase | Model | Subagent / action |
|---|--------|-------|-------------------|
| 1 | PRD analysis | fast | Task `explore` or fast: extract requirements, constraints, acceptance checks |
| 2 | Codebase scan | fast | Task `explore`: map `apps/`, `prisma/`, `observability/`, `.cursor/` |
| 3 | Planning | default | Single consolidated plan in `context.json` |
| 4 | Decomposition | default | Atomic tasks (5–10 min each), dependency list, `model: "fast" \| "default"` |
| 5 | Implementation | mostly fast | For each task group: Task subagent with minimal prompt + path to `context.json` |
| 6 | Review | fast, readonly | Task `explore` readonly per domain: `database`, `backend`, `frontend` |
| 7 | Report | fast | Summarize in chat + write `REPORT.md` next to `context.json` |

## Rules for tasks

- Each task: **id**, **title**, **type** (`database` | `backend` | `frontend` | `infra` | `cursor` | `docs`), **complexity** (`low`|`medium`|`high`), **model**, **status**, optional **skill** name (e.g. `signal-lab-observability`).
- **fast** (~80%): migrations, DTOs, simple endpoints, metrics lines, UI components, Compose edits, `.mdc` rules.
- **default** (~20%): cross-cutting design, security, orchestration, ambiguous PRD interpretation.

## Delegation protocol

The orchestrator **does not** implement large diffs in the main turn. It:

1. Reads `context.json`.
2. Picks the next `pending` task compatible with completed dependencies.
3. Launches **Task** with: objective, files to touch, acceptance criteria, and “read/write `context.json` when done”.
4. Merges subagent summary into `context.json` (`tasks[].status`, phase results).
5. Repeats until blocked or done.

## Review loop (per domain)

For `database`, `backend`, `frontend`:

1. Run readonly reviewer subagent with rubric from `RUBRIC.md` / PRD acceptance.
2. If failed: spawn implementer with reviewer notes (max **3** rounds).
3. After 3 failures: mark task `failed`, continue others.

## Resume

- If stopped mid-way, re-read **latest** `.execution/*/context.json` (newest dir by name).
- **Do not** redo phases with `status: "completed"`.
- Set `currentPhase` to the first incomplete phase; pick first `pending` task.

## Final output (chat)

Print a short report: counts completed/failed, model usage estimate, verification commands from `README.md`, and “next manual steps”.

## Skills to combine

- `signal-lab-observability`, `signal-lab-nest-endpoint`, `signal-lab-prisma-migration`
- Marketplace: `nestjs-best-practices`, `prisma-orm`, `shadcn-ui`, `docker-expert` (see root `README.md`)
