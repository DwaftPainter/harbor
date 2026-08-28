# Organizations

Status: Implemented  
Owner: Core product team  
Phase: 03

## Purpose

Provide Harbor's tenant, collaboration, and data-ownership boundary.

## Responsibilities

Organization creation, naming, active context, invitations, membership
lifecycle, ownership transfer, archive/delete policy, and isolation.

## User stories

- As a user, I can create and switch organizations.
- As an owner/admin, I can invite and manage members.
- As an owner, I can transfer ownership without leaving the organization
  ownerless.

## Domain concepts

Organization, membership, invitation, owner, active organization, suspended
membership, ownership transfer, archive, and deletion request.

## Entities

Organization, membership, and invitation. Invitations contain expiring,
single-use token fingerprints and normalized recipient identity.

## Relationships

Organizations have memberships and tenant-owned resources. Users join through
memberships. An organization has at least one owner while active.

## Permissions

`organization.read`, `organization.update`, `organization.delete`,
`member.invite`, `member.update`, `member.remove`, and
`ownership.transfer`, mapped by the authorization specification.

## API overview

Organization CRUD is minimal; membership/invitation and ownership transfer are
subresources or explicit operations. List APIs are scoped to authenticated
membership. Sensitive submissions are idempotent.

## UI overview

Organization switcher, create settings, member list, invitation status,
ownership transfer, and archive/delete surfaces with explicit consequences.

## Validation

Bound names/slugs, reserve system names, normalize invitation recipients,
enforce invitation expiry, prevent duplicate active membership, and serialize
last-owner changes.

## Edge cases

Invitation accepted by a different identity, concurrent owner removal, user in
many organizations, renamed/deleted organization, suspended member with active
session, and incomplete tenant deletion.

## Future improvements

Organization domains, SCIM, enterprise policy, billing ownership, and nested
teams.

## Dependencies

Authentication, ownership data model, authorization, audit, notification
delivery for invitations.

## Out of scope

Billing, teams, custom roles, cross-organization resource sharing, and automatic
domain enrollment.
