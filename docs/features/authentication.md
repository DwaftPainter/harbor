# Authentication

Status: Draft  
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

Sign-in, verification, recovery, and session-management surfaces. All include
pending, expired, invalid, rate-limited, success, and safe retry states.

## Validation

Normalize email according to approved identity policy; bound inputs; validate
redirects; require one-time unexpired challenges; rotate or revoke sessions after
sensitive credential changes.

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
