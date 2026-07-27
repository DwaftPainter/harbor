# Idempotency

Status: Draft

## Scope

Retryable creation, operation submission, credential-sensitive rotation, and
future provider mutations require an `Idempotency-Key`. Safe reads are naturally
idempotent and do not use a key.

## Semantics

- A key is scoped to principal, organization, endpoint operation, and a bounded
  retention window.
- Harbor stores a request fingerprint, execution state, response status, safe
  response representation, and expiry.
- The same key and same fingerprint returns the original result or current
  operation.
- The same key with materially different input returns an idempotency conflict.
- Concurrent first requests produce one committed operation.
- Keys and stored responses never contain credentials or secret values.

## Failure behavior

Validation and authentication failures generally do not reserve a key.
Ambiguous failures after side effects retain an in-progress/unknown record and
are reconciled before replay. Terminal retriable server failures follow the
endpoint contract.

## Provider operations

Harbor's idempotency record does not prove the provider applied an action
exactly once. Provider-native idempotency keys and post-action reconciliation
are required where available; otherwise the feature must document ambiguity and
safe recovery before launch.
