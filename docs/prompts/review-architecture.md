# Prompt — Review architecture

```text
Perform an evidence-based Harbor architecture review.

Change/proposal: [description or diff]
Approved architecture/features/phases/ADRs: [links]
Quality attributes and expected scale: [details]

Load docs/skills/architecture.skill.md and review.skill.md. Trace dependencies,
data ownership, server/client boundaries, transaction/event flow, provider and
job boundaries, failure/recovery, observability, and deployment impact. Identify
contradictions with approved documents and distinguish defects from optional
improvements.

Output findings ordered by severity with evidence, affected requirement, impact,
and minimal remediation. Then list open decisions, positive conformance, and a
go/no-go recommendation. Do not implement changes or recommend distributed
services/abstractions without measured need.
```
