# Environment variables

Status: Draft  
Owner: Configuration security team  
Phase: 10

## Purpose

Show configuration-key presence and drift across application environments
without exposing secret values.

## Responsibilities

Metadata allowlist, key identity, provider/environment scope, sensitivity
classification, value scrubbing, comparison, permissions, audit, and retention.

## User stories

- As an authorized member, I can see which key names exist in each environment.
- As an operator, I can identify missing or extra keys without reading values.
- As a security reviewer, I can verify Harbor does not retain secret values.

## Domain concepts

Configuration key, scope, presence, sensitivity, masked metadata, drift, source
provider, last observed, and scrub event.

## Entities

Configuration-key metadata contains name or protected name representation,
application/environment/provider scope, sensitivity class, and observation
timestamps. It contains no secret value.

## Relationships

Metadata belongs to organization, connection, application/environment, and
optionally source resource. Comparisons occur only within one organization.

## Permissions

`configuration.read_names` is separate from general resource read.
Classification administration and exports, if added, have distinct permissions.

## API overview

Permissioned metadata lists and environment comparison. Responses never contain
value-shaped fields. Provider payload processing is scrubbed before durable
storage or error capture.

## UI overview

Key-name matrix by environment, missing/extra indicators, sensitivity badge,
source/freshness, universal masked presentation, and warning for incomplete sync.

## Validation

Name bounds and control characters, provider scope, metadata-only allowlist,
secret canaries, log/error/cache/analytics redaction, organization ownership, and
response schema denial of values.

## Edge cases

Provider API returns values unexpectedly, key names themselves are sensitive,
same name with different scopes, partial permission, deleted environment,
case sensitivity, huge key sets, and stale comparison.

## Future improvements

Policy checks, approved hashes for equality comparison, provider-side mutation,
secret rotation workflows, and integration with a dedicated secret manager.

## Dependencies

Applications/environments, provider adapters, synchronization, security
architecture, audit, and data lifecycle.

## Out of scope

Reading, storing, displaying, exporting, comparing, or logging secret values;
secret creation/rotation; and automatic remediation.
