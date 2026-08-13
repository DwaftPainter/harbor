# Authentication

Status: Review
Owner: Identity team
Phase: 02

## Purpose

Establish trustworthy user identity and secure session lifecycle for Harbor.

## Responsibilities

Sign-in, sign-out, email verification, recovery, account/session management,
protected-route identity resolution, and auth security events.

## User stories

- As a user, I can sign in and sign out safely.
- As a user, I can verify and recover my account without exposing its existence.
- As a user, I can revoke sessions I no longer trust.

## Domain concepts

Identity, account, session, verification challenge, recovery challenge, recent
authentication, expiry, and revocation. Authentication is separate from tenant
membership.

## Entities

Better Auth-managed user, account, session, and verification. Secret tokens are
never stored or logged in recoverable form unless the library contract requires
protected storage.

## Relationships

A user has accounts and sessions. Organization membership references the user
but is not owned by authentication.

## Permissions

Anonymous users may start approved auth flows. Authenticated users manage their
own profile and sessions. Administrative impersonation is out of scope.

## API overview

Better Auth endpoints provide auth lifecycle. Harbor adds stable protection,
rate limiting, redirect allowlisting, audit hooks, and error behavior. Auth
responses do not disclose whether an email exists.

## UI overview

Sign-in, verification, recovery, and session-management surfaces. Users can
review active session user agents and lifetimes, revoke one other session, or
revoke every other session. These surfaces include pending, expired, invalid,
rate-limited, success, and safe retry states.
Implemented authentication and account surfaces compose the project-owned
shadcn/ui primitives for consistent accessible controls and feedback.

## Validation

Normalize email according to approved identity policy; bound inputs; validate
redirects; require unexpired challenges; atomically consume recovery challenges;
rotate or revoke sessions after sensitive credential changes. Verification links
are idempotent after success until their one-hour expiry.

The initial email/password boundary accepts passwords from 12 through 128
characters. Browser redirects use fixed same-origin paths. Sessions expire after
seven days, refresh at most daily, and are considered fresh for ten minutes.

## Security

Account linking is disabled. Auth endpoints use Better Auth origin/CSRF
protections and Upstash-backed distributed rate limits. Session and verification
records remain durable in PostgreSQL, where recovery challenges are consumed
transactionally. UI errors do not distinguish
unknown users from invalid credentials. Harbor telemetry records allowlisted
security outcomes without credential or identity material.

## Testing

Contract tests cover policy, server-only delivery/storage, protected routes, and
session management. An isolated PostgreSQL-compatible lifecycle test covers
verified signup, enumeration-neutral recovery, expiry, replay, session
revocation, and credential replacement without contacting production services.

## Operations

`BETTER_AUTH_URL` must be the canonical origin and `BETTER_AUTH_SECRET` must be
a high-entropy secret of at least 32 characters. `BETTER_AUTH_API_KEY` is a
server-only secret used by the dashboard plugin for ownership verification and
infrastructure APIs. Apply the checked-in auth migration before serving
`/api/auth`. Resend requires `RESEND_API_KEY` plus a verified
`AUTH_EMAIL_FROM`; shared rate limiting requires the Upstash REST URL and token.
Treat sustained auth failures, delivery errors, and rate-limit events as
security-operational signals without logging credentials or challenge material.

## Edge cases

Concurrent recovery requests, replay, expired links, account linking conflicts,
deleted users, session theft, clock skew, email delivery failure, and
verification enumeration.

## Future improvements

Passkeys, MFA, enterprise SSO, and risk-based recent-authentication policy.

## Dependencies

Foundation, Better Auth ADR, auth architecture, email delivery decision, API
auth conventions, security standard.

## Out of scope

Organizations, roles, provider credentials, social login, MFA, and
impersonation in the initial phase.

## Acceptance criteria

- Anonymous dashboard requests redirect to sign-in.
- A valid account can sign in, sign out, and revoke its other sessions.
- Authentication never grants organization membership.
- Verification and recovery cannot be declared complete without email delivery.

## Operational certification

Resend is the transactional provider and Upstash Redis is the shared rate-limit
store. Production certification requires exercising delivery from the verified
sender domain and confirming shared counters with two deployed application
instances.
