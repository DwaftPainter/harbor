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
Resend provides transactional verification and recovery delivery. Upstash Redis
provides shared rate limiting, while PostgreSQL atomically consumes single-use
recovery challenges.

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
- Users can review active session user agents and lifetimes, revoke one other
  session, revoke every other session, or sign out the current session.
- Verification and enumeration-safe recovery use one-hour links delivered by
  Resend; password reset consumes its challenge and revokes existing sessions.
- Auth limits use Upstash secondary storage across instances. PostgreSQL retains
  session and verification records and atomically consumes recovery challenges.
- Allowlisted structured auth events record outcomes without identity,
  credential, cookie, URL, or request-body material.

## Documents required

- Authentication feature and architecture
- API authentication conventions
- Auth data entities and security checklist
- ADR 0004, Better Auth

## Completion checklist

- [x] Auth flows pass happy, failure, expiry, replay, and enumeration tests.
- [x] Tokens and credentials never appear in logs or client-readable storage.
- [x] Sessions can be revoked and expire according to policy.
- [x] Anonymous and authenticated route behavior is explicit.
- [x] Authentication does not imply organization authorization.

## Remaining operational evidence

- Verify Resend delivery from the production sender domain.
- Verify two deployed instances share Upstash rate-limit counters.

## Exit criteria

Users can authenticate securely and session identity is trustworthy, observable,
and independent of future tenant permissions.
