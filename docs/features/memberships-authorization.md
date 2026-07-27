# Memberships and authorization

Status: Draft  
Owner: Core security team  
Phase: 03–04

## Purpose

Ensure every organization operation is explicitly permitted and tenant-safe.

## Responsibilities

Membership state, role assignment, permission vocabulary, policy evaluation,
server enforcement, capability hints, and permission audit coverage.

## User stories

- As an owner, I can delegate administration safely.
- As a viewer, I can inspect approved data without mutating it.
- As any member, I cannot access another organization by changing an identifier.

## Domain concepts

Principal, membership, role, permission, resource owner, allow/deny, protected
ownership action, active organization, and service principal.

## Entities

Membership stores organization, user, role, state, and lifecycle timestamps.
Initial role definitions may be code/config contracts; custom role entities are
deferred.

## Relationships

A user has at most one active membership per organization. Permissions derive
from role plus current membership state and resource ownership.

## Permissions

Initial roles are owner, admin, member, and viewer. Permission names are
feature/action oriented and stable. Unknown or missing grants deny.

## API overview

Every protected endpoint documents required permission. Forbidden/not-found
concealment is consistent by resource type. Role changes and delayed operations
revalidate current authorization.

## UI overview

Member/role management plus capability-aware controls. Hidden or disabled
controls never replace server checks.

## Validation

Validate role vocabulary, active membership, organization/resource agreement,
last-owner invariant, actor limits, and recent auth for protected actions.

## Edge cases

Membership removed mid-request/job, stale UI role, concurrent ownership
transfer, deleted target, machine token with narrower scopes, and unknown future
role values.

## Future improvements

Custom roles, resource-level grants, temporary access, approval policies, and a
policy engine if current RBAC proves insufficient.

## Dependencies

Authentication, organizations, authorization architecture, audit log, and
feature permission catalogs.

## Out of scope

Attribute-based authorization, cross-tenant grants, public resources, and
provider-native permission administration.
