# Documentation workflow

Status: Draft

## Purpose

Define how Harbor turns an idea into an approved, traceable, and implementable
work package.

## Workflow

1. Open or update a feature specification from the feature template.
2. Identify the roadmap phase, prerequisites, owner, and affected documents.
3. Resolve domain terms, permissions, data ownership, API behavior, UI states,
   validation, failure modes, observability, and out-of-scope behavior.
4. Update architecture, database, API, security, testing, and operations
   documents where the feature changes a contract.
5. Record material alternatives in an ADR.
6. Review with product, engineering, security, and operations as applicable.
7. Mark documents `Approved`; record reviewer and approval date in the change.
8. Generate a bounded implementation plan and AI prompt that cite the approved
   documents.
9. Implement and verify without silently expanding scope.
10. Mark documents `Implemented`, link shipped artifacts, and record deviations.

## Entry criteria for implementation

- The feature purpose and user stories are approved.
- Permissions and organization boundaries are explicit.
- Entities, relationships, retention, and migrations are described.
- API and UI states include errors and empty/loading behavior.
- Acceptance tests and operational signals are defined.
- Dependencies and out-of-scope items are explicit.
- Unresolved questions do not alter the proposed behavior.

## Change control

Minor clarification may update an approved document without an ADR. A change to
security boundaries, persistent data meaning, external API compatibility,
provider contract, delivery topology, or major dependency requires an ADR and
re-approval.

## Traceability

Every implementation change references its feature and phase documents. Every
migration references its data-model change. Every API contract references its
feature. Every test maps to acceptance criteria or a documented quality risk.
