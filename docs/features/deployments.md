# Deployments

Status: Draft  
Owner: Deployments team  
Phase: 09

## Purpose

Present consistent, traceable deployment history across connected providers.

## Responsibilities

Deployment identity, synchronization, status normalization, application and
environment association, source context, list/detail, freshness, and retention.

## User stories

- As a viewer, I can see recent deployments and their current status.
- As a member, I can filter deployment history by application/environment.
- As an operator, I can follow safe links to source and provider diagnostics.

## Domain concepts

Deployment, provider status, normalized status, terminal/nonterminal, source
revision, trigger actor, target environment, URL, observed/started/finished time,
and redeployment.

## Entities

Deployment stores provider identity and raw status plus normalized query fields.
Logs and secret-bearing provider payloads are not stored in the initial feature.

## Relationships

A deployment belongs to an organization and provider connection, and may link to
one application, environment, source revision, and provider project resource.

## Permissions

`deployment.read`; sensitive provider metadata may require an additional
permission. No deployment mutation permission exists in this phase.

## API overview

Cursor-paginated lists by organization/application/environment with status,
provider, and time filters; detail includes safe links and last observed time.

## UI overview

Recent deployment list, application/environment history, detail timeline,
provider/raw status, source link, timestamps, stale state, and partial metadata.

## Validation

Stable external identity, status mapping, timestamp ordering tolerances, safe
URLs, source identifiers, organization relationships, and bounded metadata.

## Edge cases

Late/out-of-order updates, provider status regression, missing commit,
force-push, duplicate deployment ID across projects, indefinite in-progress,
deleted provider project, and timezone display.

## Future improvements

Logs, deployment comparison, approvals, rollback/redeploy, streaming status, and
cross-provider release correlation.

## Dependencies

Provider sync, inventory, applications/environments, GitHub context, API
pagination, and retention policy.

## Out of scope

Triggering, cancelling, promoting, or rolling back deployments; full build logs;
and claiming Harbor status is more authoritative than provider status.
