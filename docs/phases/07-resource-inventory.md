# Phase 07 — Resource inventory

Status: Review  
Estimated complexity: High

## Objective

Expose a tenant-safe inventory of normalized and provider-native resources.

## Scope

External resource identity, resource kinds, normalized status, raw metadata
policy, relationships, list/detail UI, filtering, pagination, freshness, and
soft deletion.

## Prerequisites

- Phase 06 complete with one reliable provider resource type.

## Entry criteria

- Normalization boundaries and metadata retention/redaction are approved.

## Deliverables

- Stable resource identity and provenance.
- Inventory list and detail views.
- Provider, type, status, and freshness filtering.
- Relationship and last-sync visibility.

## Implementation order

1. Finalize normalized resource contract.
2. Persist provider identity and sanitized metadata.
3. Build authorized query services.
4. Add paginated list/detail UI.
5. Test isolation, drift, deletion, and scale.

## Documents required

- Resource-inventory feature
- Provider and database architecture
- Resource entity, API pagination/filtering, and data lifecycle policy

## Completion checklist

- [x] Identity remains stable across sync runs.
- [x] Raw metadata is size-limited and secret-scrubbed.
- [x] Fresh, stale, inaccessible, and deleted states are distinguishable.
- [x] Lists are deterministic and cursor-paginated.
- [x] Cross-organization inventory access fails closed.

## Exit criteria

Users can reliably inspect provider resources and understand provenance,
freshness, relationships, and lifecycle state.
