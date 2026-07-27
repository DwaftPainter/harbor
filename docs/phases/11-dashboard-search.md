# Phase 11 — Dashboard and search

Status: Draft  
Estimated complexity: High

## Objective

Provide fast, actionable organization-level summaries and resource discovery.

## Scope

Dashboard read models, health summaries, recent deployments, sync health,
connection warnings, global search, saved filters if justified, and empty states.

## Prerequisites

- Phases 07–09 complete with stable query models.

## Entry criteria

- Dashboard questions, freshness targets, and search corpus are approved.

## Deliverables

- Organization dashboard with attributable metrics.
- Permission-filtered search across approved entity types.
- Consistent filters, pagination, loading, empty, stale, and error states.

## Implementation order

1. Define product questions and read-model contracts.
2. Establish freshness and query budgets.
3. Implement authorized summaries and search.
4. Build accessible responsive UI.
5. Test scale, stale data, partial failure, and information leakage.

## Documents required

- Dashboard and search features
- Frontend/backend architecture
- Indexing, pagination/filtering, and performance standards

## Completion checklist

- [ ] Every metric links to its source list or explanation.
- [ ] Search results cannot reveal unauthorized entity existence.
- [ ] Query plans meet documented budgets at target scale.
- [ ] Partial provider failures remain visible.
- [ ] Empty, loading, stale, and error states are distinct.

## Exit criteria

Users can answer core operational questions and locate permitted resources
quickly without sacrificing tenant isolation or provenance.
