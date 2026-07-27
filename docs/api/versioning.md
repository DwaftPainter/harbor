# API versioning

Status: Draft

## Strategy

The external API uses a major version in its base path, beginning with `/v1`.
Within a major version, compatible additions are preferred. Internal UI
contracts are not public and may evolve with the application, but still require
feature tests.

## Compatible changes

- Adding optional response fields.
- Adding endpoints or optional request fields with unchanged defaults.
- Adding opt-in filters or capabilities.
- Improving error messages without changing error codes.

## Breaking changes

- Removing or renaming fields/endpoints.
- Changing field types, meaning, nullability, defaults, or ordering.
- Requiring previously optional input.
- Removing enum values or adding values to an explicitly closed enum.
- Changing pagination semantics or weakening/altering authorization.

## Lifecycle

Proposed → preview → stable → deprecated → retired.

Preview endpoints state instability and are not covered by stable compatibility
guarantees. Stable breaking changes require a new major version or a documented
migration mechanism.

## Deprecation

Deprecation publishes replacement, rationale, affected consumers, migration
guide, dates, telemetry, and support path. Retirement occurs only after the
documented window and consumer review. Emergency security changes may shorten
the window through an approved incident decision.
