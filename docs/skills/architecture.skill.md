# Skill — Harbor architecture

## Purpose

Design and review Harbor boundaries, dependencies, data flow, quality
attributes, and evolution without premature distribution or abstraction.

## Principles

Modular monolith first; feature ownership; dependencies inward; explicit trust
boundaries; PostgreSQL source of truth for Harbor; providers authoritative for
external state; measurable evolution.

## Required context

System and affected architecture docs, phase/feature specs, ADRs, ownership/API
docs, expected scale, security/reliability needs, and current dependency graph.

## Workflow

1. State forces and prioritized quality attributes.
2. Map actors, containers, modules, data owners, and trust boundaries.
3. Trace request, transaction, event/job, provider, and failure flows.
4. Test dependency direction, consistency, recovery, telemetry, and deployment.
5. Compare the smallest viable alternatives.
6. Record material choice/exception as ADR.

## Output format

Context, constraints, diagram where useful, boundaries, flow, guarantees,
failure/recovery, tradeoffs, alternatives, risks/mitigations, validation, and
open decisions.

## Things to avoid

Microservices without evidence, generic layers with no owner, shared databases
without ownership, distributed transactions, framework leakage into domain
policy, and “future-proof” components.

## Quality checklist

- [ ] Every state and side effect has an owner.
- [ ] Tenant, credential, server/client, and provider trust boundaries are clear.
- [ ] Consistency, idempotency, retries, and recovery are explicit.
- [ ] Observability and deployment implications exist.
- [ ] Decision is minimal, reversible where possible, and ADR-backed.
