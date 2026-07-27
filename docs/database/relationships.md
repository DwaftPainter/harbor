# Entity relationships

Status: Draft

```mermaid
erDiagram
  USER ||--o{ ACCOUNT : authenticates_with
  USER ||--o{ SESSION : owns
  USER ||--o{ MEMBERSHIP : holds
  ORGANIZATION ||--o{ MEMBERSHIP : contains
  ORGANIZATION ||--o{ INVITATION : issues
  ORGANIZATION ||--o{ PROVIDER_CONNECTION : owns
  PROVIDER_CONNECTION ||--|| CONNECTION_CREDENTIAL : protects
  PROVIDER_CONNECTION ||--o{ SYNC_RUN : executes
  PROVIDER_CONNECTION ||--o{ EXTERNAL_RESOURCE : observes
  EXTERNAL_RESOURCE ||--o{ RESOURCE_RELATIONSHIP : source
  EXTERNAL_RESOURCE ||--o{ RESOURCE_RELATIONSHIP : target
  ORGANIZATION ||--o{ APPLICATION : owns
  APPLICATION ||--o{ ENVIRONMENT : contains
  APPLICATION ||--o{ RESOURCE_BINDING : groups
  EXTERNAL_RESOURCE ||--o{ RESOURCE_BINDING : assigned
  ENVIRONMENT ||--o{ RESOURCE_BINDING : scopes
  APPLICATION ||--o{ DEPLOYMENT : has
  ENVIRONMENT ||--o{ DEPLOYMENT : targets
  ORGANIZATION ||--o{ AUDIT_EVENT : records
  USER ||--o{ NOTIFICATION : receives
```

## Relationship rules

- A membership references exactly one user and one organization.
- Tenant-owned children cannot reference parents from another organization.
- A connection belongs to one organization; a resource inherits that owner and
  also stores it directly where needed for safe query scoping.
- An external resource is unique by connection, provider resource kind, and
  provider-native identifier.
- A resource relationship joins resources in the same organization and normally
  the same provider connection unless a documented cross-provider link exists.
- An environment belongs to one application; both belong to the same
  organization.
- A resource binding belongs to one organization and cannot cross application,
  environment, or resource ownership.
- A deployment may retain an application/environment association after a source
  resource becomes stale.
- Audit events may reference deleted actors or targets through immutable
  identifiers and safe display snapshots.

## Cardinality review

Cardinality changes are data-model changes. They require updated feature
semantics, migration/backfill behavior, authorization impact, and an ADR when
the ownership model changes.
