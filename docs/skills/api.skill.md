# Skill — Harbor API

## Purpose

Design and review stable Harbor HTTP/application boundaries with consistent
authorization, validation, errors, pagination, idempotency, and limits.

## Principles

Resource-oriented contracts; organization scope never trusted from input;
application services enforce permission; opaque identifiers/cursors; stable safe
errors; asynchronous work is a resource.

## Required context

Feature contract, API convention set, authorization architecture/permissions,
entity ownership, data sensitivity, idempotency needs, consumers, expected
traffic, and version/support policy.

## Workflow

1. Identify actor, tenant, permission, resource, and use-case invariant.
2. Define resource paths, methods, input/output schemas, and async behavior.
3. Define validation, errors, concealment, pagination/filter/sort.
4. Define idempotency, concurrency, rate limits, audit, and telemetry.
5. Check compatibility and OpenAPI impact.
6. Build contract/security/tenant tests before declaring stable.

## Output format

Endpoint/resource table, schema summaries, permissions, error codes, pagination
and idempotency semantics, examples without secrets, compatibility analysis, and
test matrix.

## Things to avoid

UI-shaped endpoints, arbitrary RPC verbs, raw database/provider errors, offset
pagination on mutable large data, client-enforced authorization, secret echo,
unversioned public contracts, and undocumented defaults.

## Quality checklist

- [ ] Auth, organization, permission, and ownership checks are explicit.
- [ ] Inputs/outputs/errors are bounded and stable.
- [ ] Retry, concurrency, idempotency, and rate limits are defined.
- [ ] Pagination/filtering are deterministic and indexable.
- [ ] Security, audit, telemetry, compatibility, and tests are complete.
