# Phase 03 — Organizations

Status: Draft  
Estimated complexity: High

## Objective

Introduce organizations as Harbor's tenant and ownership boundary.

## Scope

Organization creation, membership, invitations, active organization selection,
member lifecycle, ownership transfer, and deletion constraints.

## Prerequisites

- Phase 02 complete.
- Organizations feature and ownership model approved.

## Entry criteria

- Tenant terminology, membership states, and single-owner constraints are
  decided.

## Deliverables

- Organization and membership lifecycle.
- Invitation acceptance and expiration.
- Tenant-scoped navigation and server context.
- Safe member removal, ownership transfer, and last-owner protection.

## Implementation order

1. Add organization, membership, and invitation model.
2. Establish active organization resolution.
3. Implement create, invite, accept, remove, and transfer workflows.
4. Apply organization scope to every tenant-owned query.
5. Add isolation and concurrency tests.

## Documents required

- Organizations and authorization feature specifications
- Database ownership and relationship documents
- Organization API contract and audit-event catalog

## Completion checklist

- [ ] Every tenant-owned record has one unambiguous organization owner.
- [ ] Cross-organization access tests fail closed.
- [ ] Invitation replay and enumeration are prevented.
- [ ] Last-owner and ownership-transfer invariants hold under concurrency.
- [ ] Organization deletion is deferred or explicitly specified.

## Exit criteria

Multiple organizations can coexist with verified data isolation and complete
membership lifecycle semantics.
