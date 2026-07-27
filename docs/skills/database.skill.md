# Skill — Harbor database

## Purpose

Design and evolve Harbor's PostgreSQL model with explicit tenant ownership,
integrity, query performance, compatibility, and recovery.

## Principles

Model approved domain meaning; organization scope is explicit; constraints
protect structure; indexes follow access patterns; migrations expand/backfill/
switch/contract; no SQL-first design.

## Required context

Feature entities/invariants, database architecture and catalog, ownership,
relationships, naming, indexing, migrations, lifecycle, access patterns, scale,
Drizzle/Neon ADRs, and current schema/history.

## Workflow

1. Review identifiers, ownership, cardinality, states, sensitive fields, and
   retention.
2. Enumerate reads/writes, ordering, transactions, uniqueness, and concurrency.
3. Propose columns/types/constraints/indexes conceptually.
4. Plan mixed-version migration, backfill, observability, rollback/recovery.
5. Only after approval, map to Drizzle and generate/review artifacts.
6. Test PostgreSQL semantics and production-shaped plans.

## Output format

Model summary, invariant/constraint table, ownership and relationship diagram,
access-pattern/index table, migration stages, risks, validation plan, and open
decisions.

## Things to avoid

SQL before approval, metadata for known fields, implicit tenant paths, nullable
shortcuts, speculative tables/indexes, destructive one-step migrations,
unbounded transactional backfills, and editing applied history.

## Quality checklist

- [ ] Every row/relationship has ownership and lifecycle.
- [ ] Constraints and transactions match invariants.
- [ ] Indexes map to named queries and cursors.
- [ ] Sensitive fields and deletion/retention are explicit.
- [ ] Migration is compatible, observable, tested, and recoverable.
