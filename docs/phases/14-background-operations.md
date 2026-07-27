# Phase 14 — Background operations

Status: Draft  
Estimated complexity: Very high

## Objective

Support controlled, asynchronous Harbor operations with status, cancellation,
authorization, and recovery.

## Scope

Generic operation records only for proven use cases, long-running exports or
resyncs, cancellation, progress, idempotency, result retention, and admin tools.
Provider mutations remain separately gated.

## Prerequisites

- Phase 06 job reliability is proven.
- At least one real asynchronous operation is approved.

## Entry criteria

- Operation use case, authorization-at-execution policy, and cancellation
  semantics are approved.

## Deliverables

- Observable operation lifecycle and user-visible status.
- Idempotent submission and bounded retry.
- Cancellation where side effects permit.
- Operational replay and dead-letter procedures.

## Implementation order

1. Specify one concrete operation and state machine.
2. Define authorization and idempotency boundaries.
3. Implement status/progress and worker execution.
4. Add cancellation and operator recovery.
5. Validate races, duplicate submission, and partial side effects.

## Documents required

- Background-jobs feature and architecture
- API idempotency and error conventions
- Operations entities and incident guide

## Completion checklist

- [ ] Generic abstractions correspond to at least two proven common needs or one
      unavoidable platform primitive.
- [ ] Authorization is checked at submission and before sensitive execution.
- [ ] Progress is monotonic or explicitly non-monotonic.
- [ ] Cancellation state reflects actual side effects.
- [ ] Operators can diagnose and recover stuck work safely.

## Exit criteria

Approved long-running work executes predictably and is understandable to users
and operators throughout its lifecycle.
