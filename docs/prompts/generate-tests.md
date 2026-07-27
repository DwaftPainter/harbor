# Prompt — Generate tests

```text
Create risk-based tests for an approved Harbor increment.

Feature/phase/acceptance criteria: [links]
Changed boundaries: [domain/database/API/UI/provider/job]
Known risks and failure modes: [list]
Allowed test infrastructure: [details]

Load docs/skills/testing.skill.md and relevant security/provider/database skills.
Build a test matrix mapping each acceptance criterion, permission, invariant,
state transition, and failure mode to the smallest effective test level.
Implement deterministic tests using controlled time/randomness/external
boundaries and real PostgreSQL where semantics require it.

Always include cross-organization negative cases for tenant data, duplicate
delivery for jobs, malformed/rate-limited responses for adapters, and secret
leakage assertions where relevant. Do not chase coverage percentage or test
framework internals. Report matrix, files, executed checks, and uncovered risks.
```
