# Prompt — Refactor a feature

```text
Refactor [feature] without changing documented behavior.

Motivation and measurable issue: [details]
Approved feature/API/data contracts: [links]
Allowed scope: [files/modules]
Required verification: [tests/checks]

Load docs/skills/review.skill.md and the relevant feature skill(s). Establish a
behavioral baseline and identify exact coupling, duplication, complexity, or
performance evidence. Propose the smallest refactor that preserves public,
persistent, authorization, error, event, telemetry, and UI contracts.

Do not combine feature work, migrations, dependency upgrades, or cosmetic
rewrites unless explicitly scoped. Implement in reviewable steps, run regression
checks, and report behavioral equivalence evidence, changed dependencies,
performance impact, and remaining debt.
```
