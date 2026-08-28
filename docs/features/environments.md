# Environments

Status: Implemented  
Owner: Applications team  
Phase: 08

## Purpose

Organize application resources and deployments into stable operational contexts
such as production, preview, staging, and development.

## Responsibilities

Environment lifecycle, classification, ordering, resource bindings, provider
mapping, display, and archive constraints.

## User stories

- As a member, I can define environments meaningful to my application.
- As a viewer, I can compare resources and deployments by environment.
- As an admin, I can correct provider-derived environment suggestions.

## Domain concepts

Environment, classification, provider environment, custom label, production
designation, binding, suggestion, and archive.

## Entities

Environment belongs to an application. Resource bindings and deployments may
reference it while preserving provider-native environment values.

## Relationships

An application has many environments. A resource may follow documented binding
cardinality. All references share one organization through the application.

## Permissions

`environment.read`, `environment.create`, `environment.update`,
`environment.bind_resource`, and `environment.archive`.

## API overview

Nested application environment resources and explicit bind/unbind operations.
Ordering and production designation updates are concurrency-safe.

## UI overview

Environment tabs/list, create/edit, resource and deployment summaries,
comparison entry point, classification badges, and provider provenance.

## Validation

Name/slug bounds, one documented production designation if required, application
ownership, binding conflicts, reserved classifications, and archived-state
behavior.

## Edge cases

Multiple provider “production” concepts, preview environments with high churn,
renames, app archive, deleted resources, deployment without a mapped
environment, and concurrent production reassignment.

## Future improvements

Ephemeral environment lifecycle, policy inheritance, environment templates, and
approved provider mutations.

## Dependencies

Applications, resource inventory, deployments, configuration metadata,
authorization, and audit.

## Out of scope

Creating provider environments, deploying code, copying secrets, enforcing
promotion workflows, and assuming one universal provider environment model.
