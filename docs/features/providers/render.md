# Render provider

Status: Draft  
Owner: Integrations team  
Phase: 05–09, scheduled independently

## Purpose

Observe approved Render services, data stores, and deployment state.

## Responsibilities

Workspace identity, service/resource discovery, deploy history, environment
classification, configuration metadata only when approved, limits, and status
mapping.

## User stories

- As an admin, I can validate a Render connection and scope.
- As a member, I can inspect Render services and deploys in Harbor.

## Domain concepts

Render owner/workspace, web/private/background/cron service, static site,
database/key-value store, deploy, environment group, region, and suspend state.

## Entities

Connection and external service, data-store, deploy, and approved configuration
metadata projections.

## Relationships

Workspace connection owns resources; services have deploys and may reference
data stores/environment groups and Harbor application environments.

## Permissions

Harbor provider permissions and the minimum documented Render API credential
scope; no write capability in initial certification.

## API overview

Paginated read adapter with explicit capability/resource-kind mapping, bounded
requests, status/error classification, and rate-limit-aware sync.

## UI overview

Connection health, service inventory, type/region/status, deploy history,
freshness, and provider-console links.

## Validation

Owner identity, credential scope, resource type/status allowlists, pagination,
timestamps, URL safety, metadata scrubbing, and deletion/inaccessibility.

## Edge cases

Suspended service, blueprint-managed resources, workspace transfer, deploy
without commit, database maintenance, credential loss, unknown kinds, and
provider outage.

## Future improvements

Blueprint relationships, logs/metrics, richer datastore metadata, and separately
approved deploy/service actions.

## Dependencies

Provider core features, official Render docs, mapping/fixtures, terms/security
review, and certification.

## Out of scope

Creating/resizing/suspending services, deploy triggers, database credentials,
logs, billing, and configuration values.
