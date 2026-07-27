# Phase 15 — Public API and automation

Status: Draft  
Estimated complexity: Very high

## Objective

Expose stable, secure Harbor capabilities to automation clients.

## Scope

Versioned REST API, machine credentials, scoped tokens, idempotency, rate limits,
pagination, OpenAPI description, audit, deprecation, and initial read use cases.

## Prerequisites

- Phase 04 authorization and stable application services.
- Relevant feature contracts are implemented and mature.

## Entry criteria

- Initial consumers, scopes, support policy, and versioning strategy are
  approved.

## Deliverables

- Documented v1 API with machine authentication.
- Token creation, rotation, revocation, and last-used visibility.
- Consistent errors, cursors, filters, idempotency, and limits.
- Contract tests and generated reference documentation.

## Implementation order

1. Select minimal stable read endpoints.
2. Define token and scope model.
3. Publish OpenAPI contract and compatibility tests.
4. Implement rate limiting, audit, and observability.
5. Pilot with one automation client before mutation endpoints.

## Documents required

- API-access feature
- Entire API convention set
- Authorization, security, and data ownership documents

## Completion checklist

- [ ] API behavior is independent of UI implementation details.
- [ ] Tokens are hashed or otherwise non-recoverable after issuance.
- [ ] Organization and permission scopes are explicit.
- [ ] Rate-limit and idempotency behavior is testable.
- [ ] Breaking-change and deprecation policies are operational.

## Exit criteria

Approved clients can automate stable Harbor reads through a documented,
observable, revocable, and backward-compatible API.
