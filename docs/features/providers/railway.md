# Railway provider

Status: Draft  
Owner: Integrations team  
Phase: 05–09, scheduled independently

## Purpose

Observe approved Railway projects, environments, services, and deployments.

## Responsibilities

Workspace/project scope, environment/service/resource discovery, deployments,
domains/volumes safe metadata where approved, configuration metadata policy,
limits, and status mapping.

## User stories

- As an admin, I can connect an appropriate Railway workspace scope.
- As a member, I can inspect project environments, services, and deployments.

## Domain concepts

Railway workspace, project, environment, service, deployment, plugin/database,
volume, domain, and template-derived resource.

## Entities

Connection and external project, environment, service, deployment, and approved
volume/domain/configuration metadata projections.

## Relationships

Projects contain environments and services; deployments target service and
environment; resources map to Harbor applications/environments.

## Permissions

Harbor provider/resource/deployment permissions plus documented least-privilege
Railway token scope; read-only initial capability.

## API overview

Version-pinned read adapter with cursor handling, bounded GraphQL or REST query
complexity as officially supported, error classification, and rate awareness.

## UI overview

Connection setup/health, project/environment/service inventory, deployment
history, regions/domains safe metadata, freshness, and console links.

## Validation

Workspace/project identity, query pagination/complexity, global ID types,
status mapping, safe URLs, metadata scrub, payload bounds, and access loss.

## Edge cases

Personal/team scope, ephemeral environment, service redeploy, database plugin
credential fields, deleted environment, project transfer, schema/API evolution,
and rate limiting.

## Future improvements

Usage, logs, template context, and separately specified deploy/environment
operations.

## Dependencies

Provider core features, official Railway docs, API mapping/fixtures,
terms/security review, and certification.

## Out of scope

Project/service/environment creation, deployment triggers, variable values,
database credentials, shell access, billing, and volume mutation.
