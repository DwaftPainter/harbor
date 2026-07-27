# Phase 13 — GitHub integration

Status: Draft  
Estimated complexity: High

## Objective

Connect GitHub source context to Harbor applications and deployments.

## Scope

GitHub App installation, repositories, commits, branches, pull-request context,
webhooks, application linking, permissions, revocation, and synchronization.

## Prerequisites

- Phase 05 connection security and Phase 06 sync reliability are complete.
- Applications and deployments exist.

## Entry criteria

- GitHub App permissions, webhook verification, and repository ownership rules
  are approved.

## Deliverables

- Organization-owned GitHub installation connection.
- Repository inventory and explicit application linking.
- Verified, replay-safe webhooks.
- Commit and pull-request context on deployments where available.

## Implementation order

1. Define GitHub-specific connection and installation model.
2. Implement installation and webhook security.
3. Sync repository metadata.
4. Link applications explicitly or through confirmed suggestions.
5. Add deployment source context and failure tests.

## Documents required

- GitHub source-control feature
- Provider and synchronization architecture
- Webhook API/security conventions and provider onboarding guide

## Completion checklist

- [ ] Webhook signatures, timestamp/replay policy, and delivery IDs are enforced.
- [ ] Installation revocation stops sync and webhook processing.
- [ ] Private repository metadata follows organization permissions.
- [ ] Commit linking tolerates missing, force-pushed, and deleted references.
- [ ] Harbor does not request write scopes in this phase.

## Exit criteria

Applications and deployments can show trustworthy source context using
least-privilege, revocable GitHub access.
