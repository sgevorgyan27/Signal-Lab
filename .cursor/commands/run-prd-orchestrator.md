# /run-prd

Run the **signal-lab-orchestrator** skill.

PRD path or description:

$ARGUMENTS

Steps:

1. Create `.execution/<timestamp>/` and initial `context.json` per `COORDINATION.md`.
2. Execute phases in order; use **Task** subagents for analysis, codebase scan, implementation chunks, and readonly review.
3. Prefer **fast** model for atomic tasks; **default** for planning and decomposition.
4. On completion, write `REPORT.md` in the execution folder and print a summary in chat including verification commands from `README.md`.

If `context.json` already exists for this PRD, **resume** from the last incomplete phase.
