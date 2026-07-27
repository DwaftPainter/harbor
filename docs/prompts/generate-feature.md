# Prompt — Generate a feature

```text
You are implementing one approved Harbor feature increment.

Objective: [bounded outcome]
Approved phase: [docs/phases/...]
Approved feature: [docs/features/...]
Required architecture/data/API/ADR/standards: [links]
Allowed files/areas: [scope]
Explicit non-goals: [scope exclusions]
Acceptance criteria: [criteria]
Verification: [commands and manual checks]

Load docs/skills/feature-planning.skill.md and every cited document before
editing. Inspect existing behavior and preserve unrelated work. Produce a short
implementation plan mapping each change and test to an approved requirement.
Implement the smallest vertical increment. Enforce server-side organization
authorization, validation, error, audit, telemetry, data lifecycle, and UI
states as specified.

Do not invent missing requirements or adjacent functionality. Stop and report a
blocker if ambiguity changes security, persistent meaning, public contracts, or
user behavior. Finish with files changed, tests/checks, acceptance mapping,
deviations, and remaining approved work.
```
