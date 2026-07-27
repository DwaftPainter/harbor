# Prompt — Generate a migration

```text
You are preparing a Harbor database migration for an approved model change.

Model change: [description]
Approved feature/database docs: [links]
Compatibility window: [old/new application versions]
Expected data volume: [shape]
Allowed migration tooling: Drizzle Kit
Verification environments: [targets]

Load docs/skills/database.skill.md and migration/security/testing standards.
First describe expand/backfill/switch/contract needs, locks, rewrites, defaults,
constraints, indexes, mixed-version behavior, rollback/recovery, and observability.
Update the Drizzle schema only after confirming the approved model, then generate
and review migration artifacts through the repository workflow.

Do not apply to shared/production databases, edit applied history, include
unbounded backfills, or destroy data without explicit authority. Report generated
artifacts, safety analysis, verification evidence, rollout order, and blockers.
```
