# Phase 02 — Authentication

Status: Draft  
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
