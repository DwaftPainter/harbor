# Skill — Harbor feature planning

## Purpose

Turn a product outcome into an approved, dependency-safe, vertically deliverable
feature specification and phase work package.

## Principles

User outcome before implementation; one owning feature; smallest useful
increment; explicit permissions and tenant ownership; failure and edge cases are
requirements; deferral is deliberate.

## Required context

Roadmap/dependency graph, active phase, feature template, adjacent features,
architecture/database/API standards, product actors, known provider constraints,
and decision authority.

## Workflow

1. Define purpose, actors, user stories, success, and non-goals.
2. Define concepts, entities, ownership, relationships, states, and invariants.
3. Define permissions and abuse/security cases.
4. Define API, UI states, validation, errors, concurrency, and lifecycle.
5. Define tests, telemetry, migrations, rollout, rollback, and operations.
6. Split into ordered vertical increments and resolve/block open decisions.

## Output format

Completed feature template, acceptance checklist, dependency/phase mapping,
risk/test matrix, implementation order, required document updates, and open
questions with owner/deadline.

## Things to avoid

UI-only specs, CRUD as purpose, implicit tenant scope, provider-driven domain
design, speculative future behavior, hidden mutations, and unresolved security
decisions passed to implementation.

## Quality checklist

- [ ] User value and non-goals are unambiguous.
- [ ] Entity/state/permission invariants are testable.
- [ ] API/UI/failure/edge cases are complete.
- [ ] Dependencies and phase gates are correct.
- [ ] A small first vertical increment is implementable without invention.
