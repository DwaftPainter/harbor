# Phase 09 — Deployments

Status: Draft  
Estimated complexity: High

## Objective

Provide consistent read-only deployment history and status across providers.

## Scope

Deployment identity, status normalization, source revision, environment,
timestamps, URLs, actors, failure summaries, history/detail UI, and freshness.

## Prerequisites

- Phase 08 complete.
- Provider sync supports deployment discovery.

## Entry criteria

- Deployment status mapping and terminal-state policy are approved.

## Deliverables

- Provider deployment normalization with raw status retained.
- Application/environment deployment history and detail.
- Status, time, provider, and environment filters.
- Source and provider-console links when available.

## Implementation order

1. Define deployment identity and status taxonomy.
2. Extend adapter and sync contracts.
3. Build authorized deployment queries.
4. Add history/detail UI and links.
5. Test late updates, redeploys, missing commits, and scale.

## Documents required

- Deployments feature
- Deployment entity and API contract
- Provider mapping and retention documents

## Completion checklist

- [ ] Provider status and normalized status are both traceable.
- [ ] Late-arriving status changes converge.
- [ ] Deployment URLs are validated before presentation.
- [ ] History is deterministically paginated.
- [ ] No deployment mutation is implied or available.

## Exit criteria

Users can understand deployment history and current provider-reported status for
their applications without visiting each provider.
