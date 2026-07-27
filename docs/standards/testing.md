# Testing strategy

Status: Draft

## Test pyramid

- Unit: domain invariants, mappings, validation, permission matrices, error
  classification, and pure UI behavior.
- Integration: database constraints/queries, transactions, auth adapter,
  encryption, job handlers, and provider adapters against fixtures/fakes.
- Contract: provider/API payloads, pagination, webhooks, OpenAPI, and stable
  errors.
- End-to-end: highest-value user journeys and tenant/security boundaries.
- Operational: migrations, load, failure injection, restore, alerts, and
  runbooks.

## Required properties

- Deterministic, isolated, parallel-safe, and environment-independent.
- Real PostgreSQL for behavior depending on PostgreSQL semantics.
- No live provider APIs in ordinary CI; sanitized fixtures and controlled
  certification environments instead.
- Every tenant-owned feature includes positive and cross-tenant negative tests.
- Every job handler tests duplicate delivery and classified failure/retry.
- Time, randomness, external APIs, and queues are controllable boundaries.

## Coverage

Line coverage is diagnostic, not the objective. Required coverage is by
acceptance criterion, state transition, permission, invariant, failure mode, and
security risk.

## Test data

Use factories/builders with explicit ownership. Never copy production secrets or
personal/provider payloads into fixtures. Provider fixtures are minimal,
sanitized, versioned, and labeled with source schema version.
