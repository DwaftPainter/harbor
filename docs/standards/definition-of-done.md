# Definition of Done

Status: Draft

A work item is done only when all applicable conditions hold.

## Specification

- [ ] Feature, phase, architecture, data, API, and ADR documents were approved
      before implementation.
- [ ] Delivered behavior matches scope and acceptance criteria.
- [ ] Documentation is updated to `Implemented` with deviations resolved.

## Implementation quality

- [ ] Design follows feature ownership and boundary rules.
- [ ] Type, lint, format, build, migration, and relevant tests pass.
- [ ] No unnecessary dependency, abstraction, flag, table, or dead code.
- [ ] Error, concurrency, retry, idempotency, and rollback behavior is complete.

## Security and data

- [ ] Threats, permissions, tenant isolation, secret handling, retention, and
      audit requirements pass review.
- [ ] Database changes are compatible, tested, observable, and recoverable.

## Product quality

- [ ] Loading, empty, stale, partial, error, forbidden, and success states are
      appropriate.
- [ ] Accessibility, responsive behavior, and performance budgets pass.
- [ ] User-facing and API documentation is accurate.

## Operations

- [ ] Structured telemetry, dashboards/alerts, correlation, and safe support
      context exist.
- [ ] Deployment, feature rollout, rollback, migration, and incident procedures
      are documented and exercised in proportion to risk.
- [ ] Owners accept remaining risks and deferred items.
