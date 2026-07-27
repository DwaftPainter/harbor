# GitHub source control

Status: Draft  
Owner: Integrations team  
Phase: 13

## Purpose

Add trustworthy repository and revision context to Harbor applications and
deployments.

## Responsibilities

GitHub App installation, least-privilege permissions, repository sync, verified
webhooks, explicit application links, commit/branch/PR metadata, revocation, and
freshness.

## User stories

- As an admin, I can install Harbor for selected repositories.
- As a member, I can link a repository to an application.
- As a viewer, I can navigate from a deployment to its available source context.

## Domain concepts

GitHub installation, repository, installation repository selection, webhook
delivery, revision, branch, pull request, explicit link, and suggested link.

## Entities

GitHub provider connection/installation, external repository resource, webhook
delivery metadata, and application-repository binding.

## Relationships

One organization owns the installation connection. Selected repositories sync
under it. Application links remain same-tenant and preserve manual provenance.

## Permissions

`github_connection.manage`, `repository.read`, and
`application.bind_repository`. Harbor initially requests read-only metadata
scopes.

## API overview

Installation callback and verified webhook endpoints plus repository list and
explicit link/unlink operations. Webhook deliveries are deduplicated by signed
delivery identity.

## UI overview

Installation guidance, repository selection/health, application link workflow,
source badges/links on deployments, and revoked/inaccessible states.

## Validation

OAuth/install state and redirect, organization binding, webhook signature and
timestamp, delivery/body limits, repository selection, safe GitHub URLs, and
permission changes.

## Edge cases

Installation suspended/revoked, repository transferred/renamed/deleted,
force-push, missing commit, private-to-public change, duplicate webhook,
installation shared across GitHub orgs, and partial repository selection.

## Future improvements

PR checks, deployment status reporting, write operations, branch protection
insight, monorepo application mapping, and additional source providers.

## Dependencies

Provider connections, sync engine, applications, deployments, webhook security,
authorization, and GitHub provider review.

## Out of scope

Repository writes, CI orchestration, code browsing, secrets, branch policy
mutation, and assuming GitHub is required for every application.
