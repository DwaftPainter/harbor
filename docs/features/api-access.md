# API access

Status: Draft  
Owner: Developer platform team  
Phase: 15

## Purpose

Allow approved automation clients to access stable Harbor capabilities securely.

## Responsibilities

Machine credentials, scopes, issuance, rotation, revocation, versioned REST
contracts, idempotency, rate limits, audit, OpenAPI, deprecation, and support.

## User stories

- As an admin, I can create a narrowly scoped API credential and see it once.
- As an automation client, I receive stable errors, cursors, and limits.
- As an admin, I can revoke a credential and inspect last-used metadata.

## Domain concepts

Machine principal, API credential, secret, fingerprint, scope, expiry, last used,
rate-limit bucket, API version, deprecation, and idempotency key.

## Entities

API credential with non-recoverable secret representation, organization,
creator, name, scopes, expiry, revocation, and safe usage metadata.

## Relationships

An organization owns credentials. A credential has scopes bounded by creator
authority/policy and produces audit events and request telemetry.

## Permissions

`api_credential.read`, `api_credential.create`, `api_credential.revoke`, plus
credential scopes mapped to stable Harbor permissions.

## API overview

Versioned REST begins read-only with organization, applications, deployments,
resources, and sync status as approved. All common conventions in `docs/api/`
are mandatory.

## UI overview

Credential list, create with one-time secret display, scope/expiry selection,
copy warning, last-used visibility, rotate/revoke, and API documentation link.

## Validation

Credential name, scope subset, expiry bounds, one-time secret handling, secure
fingerprinting, constant-time verification, revoked/expired state, rate limits,
and organization context.

## Edge cases

Lost secret, leaked secret, creator removed, scope later deprecated, concurrent
rotation, unused credential, clock skew, idempotency conflict, and version
retirement.

## Future improvements

Service accounts, OAuth client credentials, webhooks, CLI, fine-grained resource
grants, and approved mutation endpoints.

## Dependencies

Stable features/application services, authorization, audit, entire API
convention set, rate limiter, OpenAPI tooling decision, and security review.

## Out of scope

Unversioned endpoints, personal permanent tokens, unrestricted admin tokens,
GraphQL, public anonymous data, and provider credential access.
