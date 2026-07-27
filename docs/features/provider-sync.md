# Provider synchronization

Status: Draft  
Owner: Integrations platform team  
Phase: 06

## Purpose

Keep Harbor's provider-derived state convergent, fresh, and diagnosable.

## Responsibilities

Scheduling, manual triggers, leases, cursors, pagination, retries, rate limits,
reconciliation, deletion detection, sync status, and telemetry.

## User stories

- As a member, I can see when provider data was last synchronized.
- As an operator, I can diagnose and safely retry a failed sync.
- As an admin, I can request a bounded refresh without creating duplicate work.

## Domain concepts

Sync capability, run, trigger, lease, checkpoint, page, observation, full versus
incremental reconciliation, stale resource, retry, and terminal failure.

## Entities

Sync run, checkpoint, lease metadata, bounded failure details, and external
resource observations. Queue messages are transport, not domain truth.

## Relationships

A connection has runs and capability checkpoints. Runs observe many resources.
One safe active run exists per connection/capability partition.

## Permissions

Members may read status; authorized roles may trigger sync; operators may retry
or release stuck work under separate audited permission.

## API overview

Sync submission returns an operation/run, supports idempotency, and rate limits
manual triggers. Status is pollable or server-refreshed. Cancellation is
available only in safe states.

## UI overview

Connection sync summary, recent runs, progress, freshness, partial failure,
retry guidance, and an operator detail view with redacted diagnostics.

## Validation

Active connection/capability, cursor ownership/version, lease token, page bounds,
provider response schema, metadata scrub, retry category, and maximum job age.

## Edge cases

Duplicate/out-of-order jobs, worker crash after provider read, cursor expiry,
provider pagination mutation, 429, partial page failure, revocation mid-run,
clock skew, and false deletion after partial sync.

## Future improvements

Provider webhooks, adaptive schedules, change streams, priority classes, and
cross-provider dependency refresh.

## Dependencies

Provider connections, adapters, background jobs, sync architecture, external
resource model, observability, and operations runbooks.

## Out of scope

Real-time guarantees, exactly-once delivery, unbounded retries, provider writes,
and silently hiding provider inconsistencies.
