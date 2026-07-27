# Dashboard

Status: Draft  
Owner: Product experience team  
Phase: 11

## Purpose

Answer the most important organization-level operational questions at a glance.

## Responsibilities

Connection and sync health, resource/application counts, deployment activity,
actionable warnings, freshness, drill-down links, and partial-failure display.

## User stories

- As a viewer, I can understand the current operational shape of my organization.
- As an operator, I can find failed connections or stale syncs quickly.
- As a new organization, I receive clear next steps rather than meaningless zeroes.

## Domain concepts

Dashboard read model, metric, time window, freshness, health summary, warning,
partial data, and drill-down.

## Entities

No dashboard-owned source-of-truth entities initially. Read models derive from
authorized feature data; cached projections require explicit freshness rules.

## Relationships

Dashboard cards link to source feature lists with identical organization scope
and filters.

## Permissions

Each metric/result applies the permissions of its source feature. A summary must
not reveal hidden resource existence.

## API overview

One bounded organization summary query or composed server reads. Responses
include generated-at/freshness and partial-error information. No generic
analytics query API.

## UI overview

Health summary, recent deployments, applications/resources, sync warnings, and
connections, with responsive layout and loading/empty/stale/partial/error states.

## Validation

Organization context, metric definitions, time windows, query budgets,
permission intersection, stable links, and freshness.

## Edge cases

No connections, partial provider outage, stale counts, permission-limited user,
large organization, deleted resource, time-window boundary, and conflicting
health signals.

## Future improvements

Customizable dashboard, saved views, trends, SLO widgets, and team-specific
views after stable use cases emerge.

## Dependencies

Connections, sync, inventory, applications, deployments, authorization, and
query performance/indexing.

## Out of scope

Arbitrary analytics, billing/cost truth, real-time guarantees, custom query
builder, and provider mutation shortcuts.
