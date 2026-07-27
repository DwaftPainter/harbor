# Background jobs

Status: Draft  
Owner: Platform team  
Phase: 06 and 14

## Purpose

Execute approved asynchronous work durably outside request lifetimes.

## Responsibilities

Job envelope, scheduling, delivery, idempotency, leases, retries, cancellation,
dead-letter handling, status, progress, telemetry, and operator recovery.

## User stories

- As a user, I can see status for long-running work I initiated.
- As an operator, I can diagnose and retry safe failures.
- As a developer, I can add a typed job without inventing retry semantics.

## Domain concepts

Job type/version, operation, attempt, schedule, lease, heartbeat, checkpoint,
idempotency key, retry category, terminal state, cancellation, and dead letter.

## Entities

Job/operation record, optional outbox record, attempt summary, and bounded
failure context. Transport payloads contain identifiers, never credentials.

## Relationships

Jobs belong to organization or platform scope, may reference actor/correlation,
and operate on feature-owned entities. Feature state remains authoritative.

## Permissions

Submission uses feature permissions. User status reads follow operation
ownership. Operator retry/cancel/release permissions are separate and audited.

## API overview

Approved operations return status resources. Submission is idempotent. Polling
is rate-limited. Cancellation is state- and side-effect-aware.

## UI overview

Operation pending/progress/success/partial/failure/cancel states plus operator
diagnostics with safe retry and correlation links.

## Validation

Job type/version, payload bounds, organization ownership, maximum age, lease
token, current feature state, retry classification, and redaction.

## Edge cases

Duplicate/delayed/out-of-order delivery, worker death, lost heartbeat, poison
message, schema version drift, cancellation race, partial side effect, revoked
permission, and queue outage.

## Future improvements

Priority lanes, workflow composition, autoscaling, regional queues, and richer
progress after proven needs.

## Dependencies

Background-job architecture, database/outbox strategy, observability, API
idempotency, audit, and feature-specific handlers.

## Out of scope

Exactly-once claims, arbitrary user-defined workflows, secret payloads,
unbounded retry, and using jobs to bypass transactions.
