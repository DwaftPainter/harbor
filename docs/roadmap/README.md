# Harbor roadmap

Status: Draft

The roadmap orders work by risk and dependency, not by visual prominence. Harbor
first establishes tenant safety and auditable identity, then proves reliable
read-only provider synchronization, and only later introduces mutations and
automation.

## Horizons

| Horizon    | Outcome                                                                | Phases |
| ---------- | ---------------------------------------------------------------------- | ------ |
| Govern     | Specifications, standards, and foundation are enforceable              | 00–01  |
| Secure     | Users operate inside isolated organizations with explicit permissions  | 02–04  |
| Connect    | Provider credentials are protected and sync is durable                 | 05–06  |
| Understand | Resources, applications, environments, and deployments are visible     | 07–09  |
| Operate    | Configuration, dashboard, search, and notifications support daily work | 10–12  |
| Automate   | GitHub, public APIs, and controlled actions extend Harbor              | 13–15  |
| Launch     | Reliability, security, and operations gates are proven                 | 16     |

## Roadmap rules

- A phase starts only when all prerequisites and required documents are
  approved.
- Read-only provider behavior precedes provider mutations.
- Every cross-tenant query has an authorization and data-isolation test.
- New provider capabilities enter through the same certification checklist.
- A milestone can be re-scoped, but its exit criteria cannot be waived silently.

Related documents:

- [Complete roadmap](complete-roadmap.md)
- [Milestones](milestones.md)
- [Development philosophy](development-philosophy.md)
- [Dependency graph](dependency-graph.md)
- [Recommended implementation order](implementation-order.md)
- [Phase specifications](../phases/README.md)
