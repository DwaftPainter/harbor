# Skill — Harbor provider integrations

## Purpose

Add and review provider capabilities without leaking vendor semantics,
credentials, or failure behavior into Harbor's core.

## Principles

Read-only first; least privilege; explicit capabilities; preserve provenance;
normalize conservatively; bounded external calls; at-least-once/idempotent sync;
provider terms and limits are requirements.

## Required context

Provider and sync architecture, connection/sync/inventory feature specs,
onboarding guide, provider official API documentation/version, auth/scopes, rate
limits, fixtures, data classification, and adapter contracts.

## Workflow

1. Document provider identity/scope/auth and capability matrix.
2. Map identifiers, fields, statuses, pagination, deletion, and sensitivity.
3. Classify errors, limits, timeouts, retries, and request IDs.
4. Define fixtures and contract tests for all failure/page cases.
5. Implement validation/read capability behind controlled rollout.
6. Verify convergence, revocation, observability, and provider compliance.

## Output format

Capability and field-mapping tables, credential/scope requirements, pagination/
rate-limit/error contract, threat model, certification matrix, rollout/rollback,
and unsupported behavior.

## Things to avoid

API calls before documentation, plaintext credentials, unbounded concurrency,
generic catch-all adapters, lowest-common-denominator data loss, fake empty
support, automatic writes, raw payload persistence, and live CI calls.

## Quality checklist

- [ ] Scopes, credentials, identity, and revocation are safe.
- [ ] Capabilities and unsupported cases are explicit.
- [ ] Pagination, retries, limits, deletions, and unknown fields are tested.
- [ ] Metadata is scrubbed and bounded with provenance preserved.
- [ ] Sync converges and operators can diagnose/disable it.
