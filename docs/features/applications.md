# Applications

Status: Implemented  
Owner: Applications team  
Phase: 08

## Purpose

Represent a user-meaningful software application across multiple provider
resources and environments.

## Responsibilities

Application lifecycle, naming, ownership, resource grouping, overview, archive,
and provider-derived binding suggestions.

## User stories

- As a member, I can create an application and attach synchronized resources.
- As a viewer, I can see an application's environments and recent activity.
- As an admin, I can correct suggested groupings and archive obsolete apps.

## Domain concepts

Application, resource binding, manual versus suggested provenance, confidence,
primary resource, archive, and unassigned resource.

## Entities

Application and resource binding. An application has stable Harbor identity
independent of provider renames or disconnection.

## Relationships

An organization owns applications. Applications contain environments and bind
many resources. A resource binding cannot cross organizations.

## Permissions

`application.read`, `application.create`, `application.update`,
`application.bind_resource`, and `application.archive`.

## API overview

Organization-scoped application list/detail and idempotent create/update/archive
commands. Binding commands validate resource ownership and conflict policy.

## UI overview

Application list, create/edit, overview, environments, resources, deployments,
unassigned resource suggestions, archive confirmation, and stale-source states.

## Validation

Bound normalized name, documented uniqueness, organization agreement, binding
cardinality, suggestion provenance, archived-state restrictions, and optimistic
concurrency where edits conflict.

## Edge cases

Resource bound elsewhere, provider disconnection, archived app with live
resources, resource deletion/recreation, merge/split requests, and simultaneous
binding edits.

## Future improvements

Application templates, ownership teams, tags, merge/split workflows, and
automatic grouping after confirmed provider-specific rules.

## Dependencies

Organizations, authorization, resource inventory, environments, audit, and
application API/UI contracts.

## Out of scope

Source repository management, provider resource creation, billing, team
ownership, and automatic mutation based on application grouping.
