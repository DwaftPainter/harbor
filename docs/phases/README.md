# Delivery phases

Status: Draft

| Phase                                 | Name                          | Complexity | Primary exit                                |
| ------------------------------------- | ----------------------------- | ---------- | ------------------------------------------- |
| [00](00-documentation-governance.md)  | Documentation governance      | Medium     | Documentation gates are enforceable         |
| [01](01-foundation.md)                | Foundation                    | Medium     | Deployable, observable baseline             |
| [02](02-authentication.md)            | Authentication                | High       | Secure identity and session lifecycle       |
| [03](03-organizations.md)             | Organizations                 | High       | Isolated tenant membership model            |
| [04](04-authorization-audit.md)       | Authorization and audit       | High       | Deny-by-default permissions and audit trail |
| [05](05-provider-connections.md)      | Provider connections          | High       | Encrypted, validated provider credentials   |
| [06](06-synchronization-engine.md)    | Synchronization engine        | Very high  | Durable, observable read-only sync          |
| [07](07-resource-inventory.md)        | Resource inventory            | High       | Tenant-safe normalized inventory            |
| [08](08-applications-environments.md) | Applications and environments | High       | Stable application grouping model           |
| [09](09-deployments.md)               | Deployments                   | High       | Read-only deployment history                |
| [10](10-configuration-metadata.md)    | Configuration metadata        | Very high  | Secret-safe configuration visibility        |
| [11](11-dashboard-search.md)          | Dashboard and search          | High       | Useful cross-feature operational views      |
| [12](12-notifications.md)             | Notifications                 | High       | Reliable preference-aware notifications     |
| [13](13-github-integration.md)        | GitHub integration            | High       | Source context linked to applications       |
| [14](14-background-operations.md)     | Background operations         | Very high  | Controlled asynchronous actions             |
| [15](15-public-api-automation.md)     | Public API and automation     | Very high  | Versioned, rate-limited automation surface  |
| [16](16-production-hardening.md)      | Production hardening          | Very high  | Launch readiness gates pass                 |

## Universal entry criteria

- Previous required phases are complete.
- Phase and affected feature documents are approved.
- Open decisions that change scope or security are resolved.
- Acceptance, security, testing, telemetry, and rollback criteria exist.

## Universal exit criteria

- Deliverables and checklists are complete.
- Automated and manual acceptance pass.
- Security and tenant-isolation checks pass.
- Documentation reflects shipped behavior.
- Operational ownership, alerts, and recovery are documented.
- Deferred work is recorded and does not invalidate the objective.

No phase may self-certify an exception to these criteria.
