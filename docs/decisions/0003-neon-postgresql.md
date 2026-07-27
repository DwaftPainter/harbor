# ADR 0003 — Use Neon PostgreSQL

Status: Accepted  
Date: 2026-07-27  
Deciders: Architecture and operations teams

## Context

Harbor needs relational integrity, transactions, flexible querying, operational
PostgreSQL compatibility, and an environment model suitable for modern
serverless deployment and isolated development workflows.

## Decision

Use PostgreSQL hosted on Neon as Harbor's primary system of record. Use pooled or
serverless connection modes according to workload and required transaction
semantics. Database branching may support preview/testing only under data
classification policy.

## Consequences

### Positive

- PostgreSQL constraints, indexing, transactions, and ecosystem fit Harbor's
  relational tenant model.
- Neon separates compute and storage and supports elastic environments and
  branching.
- Standard PostgreSQL reduces proprietary data-model lock-in.

### Negative

- Connection mode, cold starts, pooling, quotas, and regional latency require
  measurement.
- Neon is an external operational dependency.
- Branching production data can create privacy/security risk.

### Risks and mitigations

- Connection exhaustion — approved pooling/serverless driver strategy and load
  tests.
- Region mismatch — colocate application/worker/database and measure.
- Accidental sensitive branch — sanitized fixtures by default and governed
  production-data access.

## Alternatives considered

- Self-managed PostgreSQL — greater control with much higher operational burden.
- Managed PostgreSQL from another cloud — viable fallback but less aligned with
  the established deployment model.
- Non-relational database — poorer fit for tenant relationships, permissions,
  constraints, and transactional workflows.

## Validation

Capacity tests, restore drills, connection metrics, regional latency, quota
alerts, and portability review.

## References

- [Database architecture](../architecture/database.md)
- [Neon documentation](https://neon.com/docs)
