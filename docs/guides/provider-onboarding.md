# Provider onboarding

Status: Draft

## Required discovery

- Provider authentication methods, least scopes, account/project boundaries,
  token rotation/revocation, terms, and sandbox availability.
- Resource endpoints, identifiers, timestamps, pagination, rate limits, request
  IDs, webhooks, deletions, eventual consistency, and API version policy.
- Sensitive fields and payload size limits.

## Documentation package

1. Provider capability matrix and supported resource types.
2. Connection credential/scope specification.
3. Provider-to-Harbor field and status mapping.
4. Pagination, retry, rate-limit, and deletion behavior.
5. Sanitized contract fixtures and schema versions.
6. Threat model and failure/operations runbook.
7. Certification and rollout plan.

## Certification

Validate successful/empty/multi-page reads; malformed and unknown fields;
duplicate/out-of-order results; auth and scope failure; 429/reset behavior;
timeouts/outages; deletion/inaccessibility; credential rotation/revocation;
metadata scrubbing; and convergence after retry.

## Rollout

Internal organization → limited preview → supported. Read-only precedes writes.
Every stage has metrics, rollback/disable control, documented limits, and a named
owner. Provider mutations require a separate feature specification and security
review.
