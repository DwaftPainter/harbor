# Resource inventory

Status: Draft  
Owner: Resource platform team  
Phase: 07

## Purpose

Give organizations one traceable inventory of cloud resources observed through
their connections.

## Responsibilities

Stable external identity, normalized kind/status, provider provenance, safe
metadata, relationships, freshness, lifecycle, listing, detail, and filtering.

## User stories

- As a viewer, I can find resources across connected providers.
- As a member, I can understand where a resource came from and how fresh it is.
- As an operator, I can distinguish deleted, stale, inaccessible, and failed sync
  states.

## Domain concepts

External resource, provider kind, normalized kind, observation, freshness,
stale, soft-deleted, raw status, normalized status, metadata, and relationship.

## Entities

External resource and resource relationship. Metadata is size-limited,
schema-versioned when needed, and scrubbed before storage.

## Relationships

Resources belong to one connection and organization. Relationships join
same-tenant resources and declare type, source, observation, and confidence.

## Permissions

`resource.read` and separately documented permissions for sensitive metadata.
Provider connection permissions do not automatically grant resource mutation.

## API overview

Cursor-paginated organization lists with allowlisted provider, connection, kind,
status, freshness, and text-search filters; stable detail and relationship
queries.

## UI overview

Inventory table/cards, resource detail, provenance, connection, last observed,
provider console link, relationships, stale/deleted state, and partial errors.

## Validation

External identity uniqueness, organization/connection agreement, allowed URLs,
metadata size/scrub, status mapping, relationship ownership, and cursor/filter
integrity.

## Edge cases

Provider ID reuse, moved resources, renamed projects, inaccessible versus
deleted, partial sync, unknown kinds/statuses, huge metadata, and relationship
cycles.

## Future improvements

Tags, cost context, custom resource types, graph exploration, export, and
resource-level annotations.

## Dependencies

Provider sync, data ownership/indexing/lifecycle, API pagination, authorization,
and provider mapping specifications.

## Out of scope

Provisioning, mutation, real-time state, cost billing truth, arbitrary raw
payload exposure, and cross-tenant resource sharing.
