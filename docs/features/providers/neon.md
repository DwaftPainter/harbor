# Neon provider

Status: Draft  
Owner: Integrations team  
Phase: 05–08, scheduled independently

## Purpose

Observe approved Neon project and database infrastructure metadata as provider
resources, separately from Harbor's own Neon database.

## Responsibilities

Neon organization/project scope, branches, compute endpoints, databases, safe
role metadata, regions, states, limits, and explicit separation from Harbor's
internal persistence connection.

## User stories

- As an admin, I can connect a Neon organization/project scope safely.
- As a member, I can inspect branches and compute/database topology.

## Domain concepts

Neon organization, project, branch, compute endpoint, database, role metadata,
region, suspend/active state, and connection URI sensitivity.

## Entities

Provider connection and external project, branch, endpoint, database, and
approved non-secret role projections.

## Relationships

Projects contain branches; branches contain endpoints/databases/roles. Resources
bind to Harbor applications/environments without exposing connection strings.

## Permissions

Harbor provider/resource permissions and least-privilege Neon API key scope;
Harbor never grants access based on its own database credential.

## API overview

Read-only capability adapter with project-scoped pagination, native state and ID
preservation, limit handling, and strict sensitive-field allowlist.

## UI overview

Connection health, project/branch topology, regions/status, safe console links,
and warnings when metadata is incomplete.

## Validation

Organization/project identity, scope, branch/endpoint relationships, status,
region, URL safety, payload scrub for passwords/URIs, and API limits.

## Edge cases

Sleeping endpoint, branch reset/deletion, pooled/direct URI leakage, role
password fields, project transfer, unknown state, quota failure, and same vendor
as Harbor's system database.

## Future improvements

Usage/compute insights, branch/deployment correlation, and separately specified
branch/compute operations.

## Dependencies

Provider core features, official Neon API docs, strict field mapping/fixtures,
security review, and certification.

## Out of scope

Connection strings/passwords, SQL/database access, branch creation/reset,
compute resize/start/stop, backups, and Harbor system-database administration.
