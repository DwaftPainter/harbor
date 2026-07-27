# Search and filtering

Status: Draft  
Owner: Product experience team  
Phase: 11

## Purpose

Help users locate permitted Harbor entities quickly and refine large lists
consistently.

## Responsibilities

Search corpus, indexing, ranking, filters, deterministic pagination, URL state,
authorization, highlighting, freshness, and query budgets.

## User stories

- As a user, I can search across resources and applications I may access.
- As a user, I can share a filtered list URL.
- As a keyboard user, I can navigate search results accessibly.

## Domain concepts

Search document/read model, entity type, exact filter, free-text query, ranking,
cursor, facet, freshness, and permission projection.

## Entities

No search-owned source-of-truth entity initially. A derived search projection is
introduced only if PostgreSQL queries cannot meet measured targets.

## Relationships

Every result resolves to a source entity and organization. Filters map to typed
source fields, not arbitrary provider metadata.

## Permissions

Search intersects all source permissions and must not leak matches, counts,
facets, snippets, or timing for unauthorized entities.

## API overview

Bounded search query, allowlisted entity types/filters/sorts, opaque cursors,
minimum/maximum query lengths, and explicit stale-index behavior.

## UI overview

Global command/search entry, grouped results, list filters, removable filter
chips, keyboard behavior, recent queries only if privacy-approved, and no-result
guidance.

## Validation

Query/control characters, length, allowed filters/operators, cursor integrity,
organization context, safe highlighting, rate limits, and deterministic order.

## Edge cases

Identical names, deleted/renamed entities, stale projection, permission change,
empty query, special characters, large result sets, unknown provider types, and
side-channel leakage.

## Future improvements

Dedicated search service, typo tolerance, saved searches, facets, semantic
search, and cross-organization admin search.

## Dependencies

Stable feature query models, authorization, API pagination/filtering, indexing
strategy, dashboard, and performance testing.

## Out of scope

Arbitrary SQL-like filters, provider payload search, public indexing, secret
names without permission, and AI-generated operational actions.
