# Supabase provider

Status: Draft  
Owner: Integrations team  
Phase: 05–08, scheduled independently

## Purpose

Observe approved Supabase organization and project infrastructure metadata.

## Responsibilities

Organization/project identity, regions/status, database/API/storage/auth
component metadata where officially available and safe, branches if supported,
limits, and sensitive-field exclusions.

## User stories

- As an admin, I can connect a Supabase organization with documented scope.
- As a member, I can inventory Supabase projects and high-level components.

## Domain concepts

Supabase organization, project, region, database, API endpoint, auth/storage
component, branch/preview, project status, and service key sensitivity.

## Entities

Connection and external project plus explicitly approved component/branch
metadata projections.

## Relationships

Organizations contain projects; projects expose components and may bind to
Harbor application environments. Connection scope owns all observations.

## Permissions

Harbor provider/resource permissions plus least-privilege Supabase management
API token scope; service-role and project secret keys are prohibited.

## API overview

Read-only management API adapter with explicit capability/version, pagination,
status/error mapping, timeouts, and strict response allowlist.

## UI overview

Connection health, project list/detail, region/status/components, freshness, safe
console links, and unsupported-field messaging.

## Validation

Organization/project identity, scope, status/region mapping, URL safety, payload
scrub for keys/passwords/connection strings, limits, and deletion.

## Edge cases

Paused/restoring project, branch churn, project transfer, management token
revocation, service-key fields, partial component visibility, unknown state, and
provider maintenance.

## Future improvements

Usage/health summaries, branch context, safe policy metadata, and separately
reviewed project lifecycle operations.

## Dependencies

Provider core features, official Supabase management API docs, mapping/fixtures,
security/terms review, and certification.

## Out of scope

Database queries, user/auth administration, storage contents, service/anon keys,
SQL migrations, project creation/pause/restore, and billing.
