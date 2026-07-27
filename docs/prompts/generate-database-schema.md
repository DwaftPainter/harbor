# Prompt — Generate a database schema

```text
Translate an approved Harbor conceptual model into a Drizzle schema proposal.

Approved entity/relationship/ownership docs: [links]
Feature invariants and states: [links]
Access patterns and scale: [details]
Sensitive fields and lifecycle: [details]

Load docs/skills/database.skill.md. Before editing, present a model review:
identifiers, organization ownership, relationships/cardinality, nullability,
uniqueness, checks, timestamps, encryption/hash fields, retention, deletion, and
indexes tied to named queries. Identify unresolved decisions.

Only implement after the model is Approved. Do not use metadata as a substitute
for known fields, omit tenant scope, add speculative tables, or generate SQL by
hand. Follow with migration planning and integration tests; report all
constraints and access patterns.
```
