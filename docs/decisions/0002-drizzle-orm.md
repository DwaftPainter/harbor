# ADR 0002 — Use Drizzle ORM

Status: Accepted  
Date: 2026-07-27  
Deciders: Architecture and data teams

## Context

Harbor needs type-safe PostgreSQL access, explicit schema definitions, reviewable
versioned migrations, SQL-shaped queries, and compatibility with serverless Neon
drivers without a large runtime abstraction.

## Decision

Use Drizzle ORM for typed persistence mappings and Drizzle Kit for generated,
committed migrations. Feature modules own their queries; Drizzle is not exposed
to UI components.

## Consequences

### Positive

- TypeScript schema and queries remain close to PostgreSQL concepts.
- Generated migrations are explicit and reviewable.
- Multiple PostgreSQL driver options preserve transaction/transport choices.

### Negative

- The team remains responsible for query plans, transactions, locks, and
  migration safety.
- Library schema types do not replace domain validation or authorization.
- Driver capabilities differ and must be matched to use cases.

### Risks and mitigations

- Unsafe generated migration — mandatory migration review and production-shaped
  testing.
- Cross-feature query sprawl — feature repositories and documented read models.
- Transaction assumption mismatch — document use-case guarantees and choose the
  appropriate Neon driver.

## Alternatives considered

- Prisma — stronger generated client but a heavier abstraction for Harbor's
  explicit SQL/migration preference.
- Raw SQL only — maximum control but more repetitive mapping and type drift.
- Kysely — strong query builder, but Drizzle better matches the existing schema
  and migration foundation.

## Validation

Migration reproducibility, query-plan review, transaction tests, schema drift
checks, and feature boundary reviews.

## References

- [Database architecture](../architecture/database.md)
- [Migration strategy](../database/migrations.md)
- [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview)
