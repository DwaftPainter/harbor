# Skill — Harbor testing

## Purpose

Create the smallest reliable test suite that proves Harbor requirements,
invariants, security boundaries, provider contracts, and recovery behavior.

## Principles

Risk and acceptance coverage over percentage; deterministic boundaries; real
PostgreSQL where semantics matter; cross-tenant denial is mandatory; duplicates
and partial failure are normal test cases.

## Required context

Approved acceptance criteria, states/invariants/permissions, changed boundaries,
testing/security standards, data model, provider/job/API contracts, known risks,
and available infrastructure.

## Workflow

1. Build a matrix of criteria, risks, states, permissions, and failure modes.
2. Select the lowest effective test level.
3. Control time, randomness, queues, network, identity, and provider responses.
4. Use explicit factories with organization ownership.
5. Add happy, negative, boundary, concurrency, retry, and recovery cases.
6. Run, diagnose flakiness, and report uncovered risk.

## Output format

Test matrix, fixtures/fakes, tests by level, commands/results, coverage by
requirement, performance/security cases, and remaining gaps.

## Things to avoid

Coverage theater, snapshot-only behavior tests, testing framework internals,
sleep-based timing, shared mutable fixtures, production data, live providers in
ordinary CI, and assertions that ignore tenant/error semantics.

## Quality checklist

- [ ] Acceptance, invariants, states, permissions, and edge cases map to tests.
- [ ] Cross-tenant and secret-leak tests exist where applicable.
- [ ] Jobs/providers cover duplicate, timeout, partial, rate-limit, and retry.
- [ ] Tests are deterministic, isolated, and meaningful.
- [ ] Results and remaining risks are explicit.
