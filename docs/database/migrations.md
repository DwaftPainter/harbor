# Migration strategy

Status: Draft

## Source of truth

Approved database and feature documents define intent. Drizzle schema defines
the application mapping. Generated migration artifacts are reviewed and
committed; production databases are changed only through the migration process.

## Workflow

1. Approve the model and rollout behavior.
2. Change the Drizzle schema in the owning feature.
3. Generate a migration; never hand-edit generated history without explicit
   documented reason.
4. Review locks, scan/rewrite risk, defaults, constraints, indexes, rollback,
   mixed-version compatibility, and data classification.
5. Test on empty and production-shaped databases.
6. Apply through one controlled deployment responsibility.
7. Observe duration, locks, errors, and postconditions.
8. Complete any backfill and later contraction as separate changes.

## Expand and contract

Breaking changes use:

1. Expand: add compatible structures.
2. Backfill: resumable, idempotent, observable data movement.
3. Switch: deploy reads/writes to the new shape.
4. Verify: compare invariants and stop old writes.
5. Contract: remove obsolete structures in a later release.

## Prohibitions

- No automatic destructive schema push in production.
- No migration that depends on an unbounded request process.
- No large blocking backfill inside a schema transaction.
- No dropping data without retention, backup, restore, and compatibility review.
- No editing an already-applied migration.

## Future migrations

Expected future areas include organizations and permissions, provider
connections, sync/inventory, applications/environments, deployments,
configuration metadata, audit, jobs, notifications, and API credentials. Their
exact tables are intentionally deferred to approved feature phases.
