# Audit log

Status: Draft  
Owner: Security platform team  
Phase: 04 onward

## Purpose

Provide immutable, tenant-safe evidence of security-relevant and important
domain actions.

## Responsibilities

Event taxonomy, actor, organization, action, target, outcome, occurrence,
request/correlation context, safe change summary, retention, access, and export
policy.

## User stories

- As an owner, I can review who changed organization or connection state.
- As an operator, I can correlate a user action with jobs and provider requests.
- As a security reviewer, I can investigate events without exposing secrets.

## Domain concepts

Audit event, actor type, action, target, outcome, request, correlation, safe
snapshot, security event, and retention class.

## Entities

Audit event is append-only. Actor/target identifiers and safe display snapshots
survive deletion. Sensitive input and raw provider payloads are prohibited.

## Relationships

An event belongs to an organization or platform scope and may reference actor,
target, request, job, sync run, connection, and parent correlation.

## Permissions

`audit.read` and a separately reviewed export permission. Actors cannot modify
or delete individual events.

## API overview

Cursor-paginated organization event list filtered by time, actor, action,
target type, and outcome. Export is deferred until retention and scale justify
an asynchronous operation.

## UI overview

Audit timeline, filter controls, event detail, correlation links, safe changed
fields, empty/retention-boundary state, and explicit redaction markers.

## Validation

Allowlisted action/target taxonomy, organization agreement, timestamp source,
bounded metadata, required outcome, redaction, append-only persistence, and
deterministic ordering.

## Edge cases

Deleted actor/target, anonymous auth attempt, failed action before transaction,
partial external side effect, support operator action, clock skew, high-volume
sync events, and legal hold.

## Future improvements

Signed integrity chains, external SIEM export, configurable retention, anomaly
signals, and cross-organization platform security view.

## Dependencies

Authentication, organizations, authorization, application-service transaction
policy, data lifecycle, and API pagination.

## Out of scope

Application logs, provider logs, mutable comments, storing request/response
bodies, and treating audit records as the primary domain event bus.
