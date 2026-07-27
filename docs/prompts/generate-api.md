# Prompt — Generate an API

```text
Design and implement the approved Harbor API increment.

Feature/use case: [name]
Approved feature and API docs: [links]
Actor/organization/permission: [contract]
Resources and operations: [contract]
Errors, pagination, idempotency, and limits: [contract]
Explicit non-goals: [items]

Load docs/skills/api.skill.md plus authorization, security, testing, and
Definition of Done standards. Verify the API is resource-oriented and independent
of UI internals. Implement authentication, tenant scope, permission, Zod input
validation, stable error mapping, idempotency, audit, telemetry, and contract
tests exactly as documented.

Do not create undocumented fields/endpoints, expose provider/SQL errors, or infer
organization ownership from input. Return a contract summary, files, tests,
OpenAPI impact, compatibility analysis, and deviations.
```
