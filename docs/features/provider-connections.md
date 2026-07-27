# Provider connections

Status: Draft  
Owner: Integrations team  
Phase: 05

## Purpose

Let an organization grant Harbor least-privilege, revocable access to an
external provider account or scope.

## Responsibilities

Provider catalog, connection lifecycle, credential encryption, validation,
rotation, health, capabilities, revocation, ownership, and safe display.

## User stories

- As an admin, I can connect a supported provider with clear required scopes.
- As an admin, I can diagnose an unhealthy connection without seeing secrets.
- As an admin, I can rotate or revoke access immediately.

## Domain concepts

Provider descriptor, connection, credential envelope, external account/scope,
capability, validation attempt, health, disabled, revoked, and scope deficiency.

## Entities

Provider connection, protected credential envelope, and validation history.
Ciphertext, fingerprint, key version, and safe provider account metadata are
separate fields.

## Relationships

An organization owns connections. A connection owns sync runs and external
resources. One external account may have multiple documented connection scopes.

## Permissions

`connection.read`, `connection.create`, `connection.validate`,
`connection.rotate`, and `connection.revoke`. Credential material is never a
read permission.

## API overview

Create/rotate submissions are idempotent and write-only for credentials.
Validation is bounded and may be asynchronous. Reads return descriptor, safe
identity, capabilities, health, and timestamps only.

## UI overview

Provider catalog, least-privilege setup instructions, connection list/detail,
validation progress, scope errors, rotation, disable, and revoke confirmation.

## Validation

Allowlisted provider type, credential shape/size, encrypted persistence,
provider identity and scopes, duplicate connection policy, timeout, SSRF-safe
endpoints, and redacted errors.

## Edge cases

Expired/rotated credentials, permission loss, provider outage, duplicate external
account, organization deletion, validation success followed by revocation, and
key rotation failure.

## Future improvements

OAuth installation flows, multiple credentials per connection, provider
mutation scopes, and automated scope health guidance.

## Dependencies

Organizations, authorization, audit, encryption/key management, provider
architecture, provider onboarding guide.

## Out of scope

Resource sync implementation, provider mutations, secret display, shared
cross-organization connections, and automatic credential repair.
