# Phase 04 — Authorization and audit

Status: Review  
Estimated complexity: High

## Objective

Enforce deny-by-default organization permissions and record security-relevant
activity.

## Scope

Initial roles, permission vocabulary, policy evaluation, UI capability hints,
server enforcement, audit event model, actor/target context, and retention.

## Prerequisites

- Phase 03 complete.
- Authorization and audit specifications approved.

## Entry criteria

- Role-to-permission matrix and immutable audit fields are approved.

## Deliverables

- Central authorization policy boundary.
- Owner, admin, member, and viewer role semantics.
- Auditable membership and organization operations.
- Queryable, tenant-scoped audit log.

## Implementation order

1. Define permission constants and matrix.
2. Implement organization policy evaluation.
3. Enforce permissions at all mutation and read boundaries.
4. Emit audit events in the same logical operation.
5. Add UI capability hints and adversarial tests.

## Documents required

- Authorization architecture and feature
- Audit-log feature and entity catalog
- Security and testing standards

## Completion checklist

- [x] Server checks exist regardless of UI visibility.
- [x] Unknown roles and permissions deny access.
- [x] Cross-tenant identifiers cannot influence authorization.
- [x] Critical actions emit immutable, redacted audit events.
- [x] Permission matrix has automated coverage.

## Exit criteria

All current operations are explicitly authorized and security-relevant actions
are attributable without storing secrets.
