# Orchestrator — context.json schema

Create this file at `.execution/<timestamp>/context.json` and update after every phase or task batch.

```json
{
  "executionId": "2026-04-14-1200",
  "prdPath": "prds/002_prd-observability-demo.md",
  "status": "in_progress",
  "currentPhase": "implementation",
  "phases": {
    "analysis": { "status": "completed", "result": "…" },
    "codebase": { "status": "completed", "result": "…" },
    "planning": { "status": "completed", "result": "…" },
    "decomposition": { "status": "completed", "result": "…" },
    "implementation": { "status": "in_progress", "completedTasks": 3, "totalTasks": 10 },
    "review": { "status": "pending" },
    "report": { "status": "pending" }
  },
  "tasks": [
    {
      "id": "task-001",
      "title": "Example: add metric for new scenario type",
      "type": "backend",
      "complexity": "low",
      "model": "fast",
      "status": "pending",
      "skill": "signal-lab-observability",
      "dependsOn": []
    }
  ]
}
```

## Resume checklist

1. Find newest `.execution/*` directory.
2. If `context.json` missing, start phase 1 from PRD path.
3. Never reset `completed` phases to `pending`.

## Subagent prompt template

Read `.execution/<id>/context.json`. Implement only **task-XXX**. Touch only listed files. Update `tasks[].status` and brief `result` in `phases.implementation` when done. Do not start other tasks. Follow `signal-lab-*` skills and repo rules.
