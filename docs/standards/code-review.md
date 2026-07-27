# Code review checklist

Status: Draft

## Documentation and scope

- [ ] Approved feature, phase, and ADR sources are linked.
- [ ] Change matches scope; deviations update documentation first.
- [ ] No speculative abstraction, dependency, entity, or API.

## Architecture

- [ ] Feature ownership and dependency direction are correct.
- [ ] Server/client and provider/domain boundaries hold.
- [ ] Transactions, jobs, retries, idempotency, and failure behavior match docs.

## Security and data

- [ ] Authentication and organization authorization are enforced server-side.
- [ ] Cross-tenant identifiers cannot escape scope.
- [ ] Secrets and sensitive metadata are minimized, encrypted/hashed, and
      redacted.
- [ ] Migration, retention, deletion, and rollback are safe.

## Correctness and quality

- [ ] Validation covers input and state invariants.
- [ ] Concurrency, partial failure, expiry, and duplicate delivery are handled.
- [ ] Tests map to acceptance criteria and meaningful risks.
- [ ] Errors and telemetry are stable, actionable, and safe.

## Experience and operations

- [ ] Loading, empty, stale, partial, forbidden, error, and success states exist.
- [ ] Accessibility and performance budgets are met.
- [ ] Metrics, alerts, support context, deployment, and rollback are sufficient.
- [ ] Documentation says `Implemented` only after conformance passes.
