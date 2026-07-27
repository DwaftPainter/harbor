# Vercel provider

Status: Draft  
Owner: Integrations team  
Phase: 05–09, scheduled independently

## Purpose

Observe approved Vercel project and deployment state within Harbor.

## Responsibilities

Connection identity/scope, team/project discovery, deployments, domains and
configuration-key metadata only when separately approved, status mapping, limits,
and provider links.

## User stories

- As an admin, I can connect a Vercel scope with least privilege.
- As a member, I can inventory projects and deployments with source provenance.

## Domain concepts

Vercel team/account, project, target environment, deployment, domain, framework,
git metadata, and API rate-limit window.

## Entities

Provider connection plus external project, deployment, and approved domain/config
metadata resource projections.

## Relationships

Connection scope owns observed resources; projects have deployments/domains and
may bind to Harbor applications/environments.

## Permissions

Harbor connection/sync/resource/deployment permissions; Vercel token scopes are
documented before approval and remain read-only initially.

## API overview

Adapter capabilities paginate provider endpoints, preserve native IDs/statuses,
classify auth/scope/limit failures, and expose no raw credential or payload.

## UI overview

Connection setup/health, Vercel resources and deployments, raw/normalized status,
freshness, and safe console links.

## Validation

Official token/team identity, requested scope, pagination, URLs, timestamps,
status mapping, metadata allowlist, size/redaction, and provider limits.

## Edge cases

Personal versus team scope, project transfer/rename, preview churn, deployment
alias changes, token revocation, inaccessible project, unknown status, and 429.

## Future improvements

OAuth installation, logs, domains/config comparison, and separately specified
deployment mutations.

## Dependencies

Provider core features, official Vercel documentation, field mapping, fixtures,
security review, and certification.

## Out of scope

Creating projects, triggering/cancelling/rolling back deployments, DNS mutation,
secret values, billing, and unsupported enterprise metadata.
