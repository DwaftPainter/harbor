# ADR 0004 — Use Better Auth

Status: Accepted  
Date: 2026-07-27  
Deciders: Architecture and security teams

## Context

Harbor needs TypeScript-native authentication with explicit PostgreSQL storage,
session/account lifecycle, Next.js compatibility, and room for later auth
methods without building security-critical identity primitives from scratch.

## Decision

Use the pinned Better Auth version with its Drizzle adapter for authentication.
Better Auth owns user, account, session, and verification semantics. Harbor owns
organizations, memberships, authorization, provider credentials, and audit
policy.

## Consequences

### Positive

- Established auth lifecycle and adapter model reduce custom security code.
- Database-backed schema remains visible and migratable.
- Framework-agnostic core limits coupling to Next.js entry points.

### Negative

- Auth schema and behavior must remain compatible with pinned library versions.
- Plugin availability does not make advanced auth features automatically in
  scope.
- Harbor still owns abuse protection, delivery, authorization, and operations.

### Risks and mitigations

- Upgrade schema drift — review Better Auth release/schema guidance and generate
  migrations per upgrade.
- Auth/authorization confusion — enforce the documented boundary.
- Session misconfiguration — threat model, secure cookie/session tests, and
  revocation procedures.

## Alternatives considered

- Custom auth — unacceptable security and maintenance cost.
- Auth.js — viable, but Better Auth's explicit TypeScript/database model matches
  the current foundation.
- Hosted identity provider — operationally attractive but introduces stronger
  vendor/data-flow dependency before enterprise requirements are known.

## Validation

Auth threat model, flow tests, session/revocation tests, schema compatibility,
rate limiting, and dependency security review.

## References

- [Authentication architecture](../architecture/authentication.md)
- [Authentication feature](../features/authentication.md)
- [Better Auth documentation](https://www.better-auth.com/docs)
