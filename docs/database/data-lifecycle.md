# Data lifecycle

Status: Draft

## Data classes

| Class              | Examples                             | Default handling                                 |
| ------------------ | ------------------------------------ | ------------------------------------------------ |
| Credentials        | Provider secrets, session/API tokens | Encrypt or hash; never log; revoke and purge     |
| Personal           | Email, name, IP/user agent           | Minimize, access-control, retain by policy       |
| Tenant operational | Resources, deployments, sync state   | Organization-owned; freshness and deletion state |
| Security audit     | Actor/action/target/outcome          | Immutable, redacted, longer retention            |
| Ephemeral          | Verification, cursors, leases        | Expire and purge                                 |
| Telemetry          | Logs, metrics, traces                | Redact, sample, bounded retention                |

## Lifecycle stages

Collection → validation/scrubbing → active use → archive/stale state → retention
expiry → purge or irreversible anonymization.

## Provider disconnection

Immediately prevent credential use and new sync. Mark associated data
inaccessible or stale according to product policy. Retain enough provenance,
audit, and historical deployment context for the documented period, then purge
provider metadata.

## User and organization deletion

Deletion requires identity verification, authorization, legal/retention checks,
job cancellation, credential revocation, data inventory, safe cascading,
telemetry handling, and completion evidence. Backups age out under the backup
retention policy rather than being selectively rewritten unless legally
required.

## Policy ownership

Exact durations are unresolved product/legal decisions and must be approved
before affected features launch. Code must use centrally documented retention
classes rather than scattered durations.
