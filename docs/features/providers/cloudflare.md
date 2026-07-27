# Cloudflare provider

Status: Draft  
Owner: Integrations team  
Phase: 05–09, scheduled independently

## Purpose

Observe a deliberately narrow set of Cloudflare account and application
resources without turning Harbor into a generic Cloudflare console.

## Responsibilities

Account/zone scope, explicit capability catalog, initial Workers/Pages project
and deployment metadata if approved, safe DNS/domain context if approved,
pagination, token verification, limits, and status mapping.

## User stories

- As an admin, I can connect a least-privilege Cloudflare API token.
- As a member, I can inspect only the Cloudflare resource kinds Harbor supports.

## Domain concepts

Cloudflare account, zone, API token permission group, Worker, Pages project,
deployment, route/domain, D1/KV/R2 binding metadata, and global rate limit.

## Entities

Connection and only approved external zone/application/deployment resource
projections. Each capability is independently certified.

## Relationships

Account connections own observed resources; zones and application resources may
relate but preserve native account/zone identity and Harbor application binding.

## Permissions

Harbor provider/resource/deployment permissions plus resource-specific
least-privilege Cloudflare token permission groups.

## API overview

Capability-specific read adapters; no universal endpoint wrapper. Handle result
envelopes, pagination, API token verification, bounded concurrency, and
provider-specific error/rate metadata.

## UI overview

Token setup with exact scopes, connection/capability health, supported resource
inventory, deployments where approved, freshness, and safe dashboard links.

## Validation

Token verification, account/zone ownership, capability scope, IDs/statuses,
pagination, URL/domain safety, sensitive binding metadata scrub, and result size.

## Edge cases

Multi-account token, zone transfer, partial permission groups, Workers/Pages
model differences, deleted namespace, API token revocation, global throttling,
and large account resource counts.

## Future improvements

D1/KV/R2 metadata, analytics summaries, additional application services, and
separately specified cache/DNS/deployment mutations.

## Dependencies

Provider core features, official Cloudflare API docs, per-capability mappings/
fixtures, terms/security review, and certification.

## Out of scope

Broad Cloudflare coverage, DNS/cache/security rule mutation, object or KV data,
secrets/bindings values, traffic analytics warehouse, and account administration.
