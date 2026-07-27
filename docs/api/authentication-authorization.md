# API authentication and authorization

Status: Draft

## Human sessions

Browser and first-party UI requests use Better Auth sessions with CSRF,
origin, cookie, and redirect protections appropriate to the entry point.

## Machine credentials

Public API clients use organization-owned credentials created in Phase 15.
Secret material is displayed once, stored non-recoverably where possible, and
supports scopes, expiry, rotation, revocation, description, creator, and
last-used metadata.

## Authorization

Every request resolves:

1. credential and actor or machine principal;
2. active organization or explicitly addressed organization;
3. active membership or machine grant;
4. required permission;
5. resource ownership and state.

Organization identifiers supplied by clients do not establish scope.
Authorization is enforced in application services in addition to entry-point
guarding.

## Sensitive operations

Credential rotation, ownership changes, destructive operations, exports, and
future provider mutations may require recent authentication, stronger role,
additional confirmation, and mandatory audit.

## Webhooks

Incoming provider webhooks use provider-specific signature validation,
timestamp tolerance, delivery-id deduplication, body-size limits, and connection
resolution. Webhooks never use browser sessions and never trust tenant identity
from unsigned payload fields.
