# Phase 02 — Authentication

Status: Review
Estimated complexity: High

## Objective

Provide secure user identity, sign-in, sign-out, verification, recovery, and
session management.

## Scope

Better Auth integration, auth routes, email identity, session lifecycle,
account linking policy, auth UI, abuse controls, audit hooks, and recovery.

## Prerequisites

- Phase 01 complete.
- Authentication architecture and feature specification approved.

## Entry criteria

- Identity methods, session policy, email delivery dependency, and threat model
  are decided.

The initial implementation is authorized for email/password identity with a
seven-day renewable database session, a 24-hour refresh interval, a ten-minute
freshness window, and explicit session revocation. Account linking is disabled.
Email delivery is not selected, so verification and recovery flows are blocked
from completion and this phase is not production-certified.

## Deliverables

- User, account, session, and verification lifecycle.
- Accessible authentication UI and safe redirect behavior.
- Session revocation and protected-route enforcement.
- Security events and rate limits for sensitive endpoints.

## Implementation order

1. Confirm schema compatibility and migration.
2. Configure server-only auth boundary.
3. Implement protected-session resolution.
4. Add sign-in, sign-out, verification, and recovery flows.
5. Add abuse, audit, and session-management tests.

## Current implementation

- Better Auth is mounted at `/api/auth` with the Drizzle PostgreSQL adapter.
- The Better Auth Infrastructure dashboard plugin is mounted with a required
  server-only API key for project ownership verification.
- Email/password sign-up and sign-in enforce a 12–128 character password
  boundary and generic UI failure messages.
- Authentication, identity, session, empty-state, and recoverable error surfaces
  compose the project-owned shadcn/ui primitives.
- Dashboard routes resolve the authoritative server session and fail closed to
  `/sign-in`.
- Users can sign out the current session or revoke every other session.
- Built-in endpoint rate limiting is enabled as an initial per-instance abuse
  control; shared/distributed enforcement remains required before launch.

## Documents required

- Authentication feature and architecture
- API authentication conventions
- Auth data entities and security checklist
- ADR 0004, Better Auth

## Completion checklist

- [ ] Auth flows pass happy, failure, expiry, replay, and enumeration tests.
- [ ] Tokens and credentials never appear in logs or client-readable storage.
- [ ] Sessions can be revoked and expire according to policy.
- [ ] Anonymous and authenticated route behavior is explicit.
- [ ] Authentication does not imply organization authorization.

## Exit criteria

Users can authenticate securely and session identity is trustworthy, observable,
and independent of future tenant permissions.
