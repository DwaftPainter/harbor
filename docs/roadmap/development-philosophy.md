# Development philosophy

Status: Draft

## Risk-first sequencing

Harbor manages privileged access to multiple external systems. Tenant isolation,
credential security, auditability, idempotency, and recovery therefore precede
broad provider coverage or mutation workflows.

## Vertical increments

Each phase should deliver a narrow end-to-end capability: specification, data
model, authorization, API or server boundary, UI, tests, telemetry, and
operations guidance. Horizontal infrastructure is introduced only when a
current increment requires it.

## Normalize carefully

Harbor normalizes concepts that have stable shared meaning, such as provider
connection, external resource, environment, deployment, and sync run. It stores
provider-native type, identifier, URL, status, and metadata so the model remains
traceable and extensible.

## Read before write

Provider integrations progress through discovery, read-only sync, reconciliation,
and reliability validation before any provider mutation is considered.

## Defaults

- Server-rendered and server-authoritative by default.
- Organization scope is explicit in domain and persistence boundaries.
- Deny authorization unless a permission is granted.
- At-least-once jobs with idempotent handlers.
- Cursor pagination for mutable collections.
- Structured errors and structured telemetry.
- Backward-compatible migrations and APIs.
- Small modules and local ownership instead of generic frameworks.

## Deferral discipline

Deferred decisions are written as open questions with an owner and decision
deadline. “Future-proofing” alone is not sufficient reason to add an
abstraction, dependency, entity, API, or background service.
