# Entity catalog

Status: Draft

## Identity

| Entity       | Purpose                                  | Owner         | Lifecycle notes                         |
| ------------ | ---------------------------------------- | ------------- | --------------------------------------- |
| User         | Human identity recognized by Better Auth | User/platform | Personal data; deletion policy required |
| Account      | Authentication method linked to a user   | User/platform | Managed by Better Auth                  |
| Session      | Revocable authenticated session          | User/platform | Short-lived and purgeable               |
| Verification | One-time verification/recovery artifact  | Platform      | Expires and is purged                   |

## Tenancy and access

| Entity         | Purpose                                 | Owner        | Lifecycle notes                           |
| -------------- | --------------------------------------- | ------------ | ----------------------------------------- |
| Organization   | Tenant and ownership boundary           | Organization | Archive/delete requires cascade policy    |
| Membership     | User access and role in an organization | Organization | State changes are audited                 |
| Invitation     | Expiring membership invitation          | Organization | One-time acceptance; no email enumeration |
| API credential | Machine access with scoped permissions  | Organization | Secret shown once; revocable              |

## Provider integration

| Entity                | Purpose                                           | Owner                   | Lifecycle notes                        |
| --------------------- | ------------------------------------------------- | ----------------------- | -------------------------------------- |
| Provider connection   | Authorized external account/project connection    | Organization            | Credential ciphertext is never exposed |
| Connection credential | Encrypted credential envelope and key metadata    | Connection              | Rotation history policy required       |
| Sync run              | One synchronization attempt and aggregate outcome | Organization/connection | Operational retention                  |
| Sync checkpoint       | Resumable cursor/progress for a capability        | Connection              | Replaced atomically                    |
| External resource     | Last observed provider resource projection        | Organization/connection | Stale/soft-deleted before purge        |
| Resource relationship | Typed edge between external resources             | Organization            | Derived and reconciled                 |

## Product model

| Entity            | Purpose                                      | Owner                    | Lifecycle notes                                 |
| ----------------- | -------------------------------------------- | ------------------------ | ----------------------------------------------- |
| Application       | Harbor grouping for related resources        | Organization             | Archivable                                      |
| Environment       | Named application context such as production | Application              | Stable identity; label is not provider mutation |
| Resource binding  | Links a resource to application/environment  | Organization             | Manual or suggested provenance                  |
| Deployment        | Provider deployment observation              | Organization/application | Historical retention                            |
| Configuration key | Secret-safe variable/configuration metadata  | Organization/application | No secret values                                |

## Operations and communication

| Entity                  | Purpose                                   | Owner                    | Lifecycle notes                |
| ----------------------- | ----------------------------------------- | ------------------------ | ------------------------------ |
| Audit event             | Immutable security/domain activity record | Organization/platform    | Retention and legal policy     |
| Domain event            | Durable fact for asynchronous consumers   | Organization/platform    | Short operational retention    |
| Job/operation           | Durable asynchronous execution state      | Organization/platform    | Payload minimized and redacted |
| Notification            | User-visible event delivery               | User within organization | Preference and retention aware |
| Notification preference | User/channel/event preference             | User/organization        | Mandatory events may override  |
| Webhook delivery        | Verified external event receipt metadata  | Connection               | Deduplicated and bounded       |

## Entity definition rule

Before implementation, each entity must define identifiers, ownership, mutable
fields, invariants, state transitions, timestamps, sensitive fields, retention,
unique constraints, expected access patterns, and deletion behavior in its
owning feature document.
