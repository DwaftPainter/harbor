# Ownership and tenancy

Status: Draft

## Ownership hierarchy

The organization is the tenant boundary for product and provider data. Users are
global identities connected to organizations only through memberships.

| Data class                                        | Ownership                                |
| ------------------------------------------------- | ---------------------------------------- |
| Auth user/account/session/verification            | User/platform, managed by Better Auth    |
| Organization/membership/invitation                | Organization, with global user reference |
| Connections, resources, sync runs                 | Organization                             |
| Applications, environments, bindings, deployments | Organization                             |
| Audit events and organization notifications       | Organization                             |
| Platform telemetry and global provider catalog    | Platform; contains no tenant secret      |

## Query rule

Every tenant-owned read and write must receive organization context from trusted
membership resolution and constrain the query by that organization. Looking up
a row globally and checking later is prohibited unless a reviewed helper proves
equivalent safety.

## Redundant ownership

Direct organization identifiers may appear on deep child records to make tenant
scoping explicit and indexable. Redundancy is accepted only with constraints or
transactional invariants that prevent disagreement with the ownership chain.

## Shared and global data

Provider descriptors, feature definitions, and static catalogs may be global.
Credentials, connection health, provider account identity, quotas, and metadata
are never global or shared between organizations.

## Deletion

Organization deletion is a governed workflow, not an unconstrained cascade. It
revokes credentials and tokens, stops jobs, exports or retains required audit
data, deletes or anonymizes tenant data according to policy, and records the
final operation outside the deleted tenant boundary where legally required.
