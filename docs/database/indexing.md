# Indexing strategy

Status: Draft

## Principles

- Index documented access patterns, uniqueness, ownership, and job scheduling.
- Prefer composite indexes beginning with organization or connection scope for
  tenant lists.
- Match index ordering to deterministic pagination ordering.
- Avoid speculative indexes; verify query plans at representative scale.
- Review write amplification and storage cost for every additional index.

## Required strategy by area

| Area          | Access pattern                                                          |
| ------------- | ----------------------------------------------------------------------- |
| Membership    | Organization members; user organizations; unique user/organization      |
| Invitations   | Organization list; normalized recipient; token fingerprint; expiry      |
| Connections   | Organization/provider list; unique external account where required      |
| Resources     | Organization filters; connection/kind/external ID uniqueness; freshness |
| Sync runs     | Connection/capability recent runs; active lease; scheduled retries      |
| Applications  | Organization name/list; archived state                                  |
| Bindings      | Application/environment; resource uniqueness; organization safety       |
| Deployments   | Organization/application/environment ordered by provider occurrence     |
| Audit events  | Organization ordered by occurrence; actor, action, target filters       |
| Notifications | Recipient unread/recent; delivery retry schedule                        |
| Jobs          | Runnable status plus scheduled time; lease expiry; idempotency key      |

## Pagination

Cursor indexes include the stable tie-breaker, normally a unique identifier,
after the primary sort fields. Cursor contracts and database ordering must
evolve together.

## Flexible metadata

JSON or text metadata is not generally indexed. A field that becomes a stable
filter or invariant should graduate to a typed column through a documented
migration.

## Review evidence

Before launch and material scale changes, capture representative cardinalities,
query plans, latency percentiles, rows examined, index size, and write cost for
critical queries.
