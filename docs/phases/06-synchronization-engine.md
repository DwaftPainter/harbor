# Phase 06 — Synchronization engine

Status: Review  
Estimated complexity: Very high

## Objective

Synchronize provider resources durably, idempotently, and observably.

## Scope

Job transport, sync runs, checkpoints, leases, pagination, retries, backoff,
rate limits, reconciliation, deletion detection, cancellation, and telemetry.

## Prerequisites

- Phase 05 complete.
- Synchronization and background-job architectures approved.

## Entry criteria

- Delivery guarantees, job platform, scheduling policy, and stale-resource policy
  are decided.

## Deliverables

- Durable sync-run state machine and job contract.
- Incremental provider pagination with bounded concurrency.
- Idempotent resource upsert and explicit stale/deleted handling.
- Manual and scheduled sync with status visibility.

## Implementation order

1. Define job, sync-run, cursor, and lease semantics.
2. Implement worker observability and retry taxonomy.
3. Implement one provider resource discovery path.
4. Add reconciliation, cancellation, and recovery.
5. Load, fault, duplication, and rate-limit testing.

## Documents required

- Synchronization and background-jobs architecture
- Provider-sync and background-jobs features
- Job, sync-run, and external-resource entities

## Completion checklist

- [x] Duplicate and out-of-order delivery are safe.
- [x] Concurrent syncs obey connection-level lease rules.
- [x] Partial failure resumes without corrupting inventory.
- [x] Rate-limit responses defer work rather than amplify traffic.
- [x] Metrics expose lag, duration, errors, retries, and inventory changes.

## Exit criteria

Repeated read-only syncs converge on the same provider state and recover from
process, network, pagination, and rate-limit failures.
