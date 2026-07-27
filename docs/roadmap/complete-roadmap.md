# Complete roadmap

Status: Draft

This is the outcome-level view of every planned Harbor phase. Detailed scope and
gates live in the linked phase documents.

| Phase                                           | Outcome                           | Depends on              | Demonstrating completion                                                |
| ----------------------------------------------- | --------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| [00](../phases/00-documentation-governance.md)  | Governed documentation system     | Vision                  | Approved, linked, validated specifications and standards                |
| [01](../phases/01-foundation.md)                | Deployable foundation             | 00                      | Reproducible build/deploy, configuration, telemetry, quality gates      |
| [02](../phases/02-authentication.md)            | Secure identity/session lifecycle | 01                      | Auth threat cases and revocation pass                                   |
| [03](../phases/03-organizations.md)             | Isolated tenant collaboration     | 02                      | Membership lifecycle and cross-tenant denial pass                       |
| [04](../phases/04-authorization-audit.md)       | Explicit permissions and evidence | 03                      | Permission matrix and audit completeness pass                           |
| [05](../phases/05-provider-connections.md)      | Protected provider access         | 04                      | One credential can validate, rotate, and revoke safely                  |
| [06](../phases/06-synchronization-engine.md)    | Durable convergent sync           | 05                      | Duplicate/failure/rate-limit reconciliation passes                      |
| [07](../phases/07-resource-inventory.md)        | Unified read-only inventory       | 06                      | Provenance, freshness, lifecycle, isolation, and scale pass             |
| [08](../phases/08-applications-environments.md) | Stable application grouping       | 07                      | Same-tenant bindings and correction workflows pass                      |
| [09](../phases/09-deployments.md)               | Cross-provider deployment history | 08                      | Status convergence and deterministic history pass                       |
| [10](../phases/10-configuration-metadata.md)    | Secret-safe config comparison     | 08                      | Secret canaries prove values cannot escape                              |
| [11](../phases/11-dashboard-search.md)          | Operational overview/discovery    | 07–09                   | Useful, fresh, permission-safe views meet budgets                       |
| [12](../phases/12-notifications.md)             | Actionable event delivery         | 04, 06                  | Deduplication, preferences, eligibility, and retry pass                 |
| [13](../phases/13-github-integration.md)        | Source context                    | 05, 06, 08, 09          | Least-privilege install, webhook, and link flows pass                   |
| [14](../phases/14-background-operations.md)     | Controlled long-running work      | 06                      | Status, authorization, idempotency, cancellation/recovery pass          |
| [15](../phases/15-public-api-automation.md)     | Secure automation API             | 04 plus stable features | Version, token, scope, contract, limit, and audit tests pass            |
| [16](../phases/16-production-hardening.md)      | Controlled production launch      | Launch scope            | Security, restore, performance, accessibility, SLO, rollback gates pass |

## Provider rollout within the roadmap

Provider breadth is not a separate parallel track. Each provider repeats the
Phase 05–07 certification path:

1. document identity, scopes, terms, capabilities, mappings, and limits;
2. validate encrypted/revocable connection lifecycle;
3. certify read-only adapter and sync convergence;
4. expose approved inventory/application/deployment data;
5. operate in limited preview with metrics and disable control;
6. graduate to supported status;
7. specify any write capability as a separate later feature.

Vercel, Render, Neon, Railway, Supabase, Cloudflare, and GitHub are candidates,
not a promise that all capabilities launch simultaneously.

## Roadmap change process

A roadmap change updates dependencies, milestones, affected phases/features,
risks, and delivery order before implementation. Removing a phase requires
showing where its security, data, quality, and operational outcomes moved; it
cannot simply erase a gate.
