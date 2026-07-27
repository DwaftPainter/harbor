# ADR 0005 — Use feature-based architecture

Status: Accepted  
Date: 2026-07-27  
Deciders: Architecture team

## Context

Harbor will contain many related domains and provider integrations. Layer-only
folders tend to scatter one feature across the repository and make ownership,
AI context selection, testing, and later extraction difficult.

## Decision

Organize product behavior by feature under `src/features`. Keep only genuinely
shared UI, configuration, types, database infrastructure, and integration
contracts in shared top-level areas. Routes compose feature entry points.

## Consequences

### Positive

- Behavior, validation, persistence, UI, and tests are discoverable together.
- Feature documents map directly to implementation ownership.
- Smaller context sets improve human and AI changes.

### Negative

- Some duplication is accepted before a stable shared abstraction emerges.
- Cross-feature dependencies require deliberate contracts.
- Teams must resist moving domain behavior into generic `lib` folders.

### Risks and mitigations

- Circular imports — dependency rules, lint boundaries, and architecture review.
- Premature shared utilities — require multiple current callers and neutral
  semantics.
- Feature silos — shared vocabulary and application-service contracts.

## Alternatives considered

- Technical-layer architecture — simple initially but scatters feature changes.
- Full domain-driven microservices — excessive deployment and consistency cost.
- Provider-first organization — makes external vendors, rather than Harbor
  domains, own product behavior.

## Validation

Change locality, dependency graph checks, review clarity, test isolation, and
absence of cyclic feature dependencies.

## References

- [Folder structure standard](../standards/folder-structure.md)
- [System architecture](../architecture/system-overview.md)
