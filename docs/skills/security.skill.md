# Skill — Harbor security

## Purpose

Threat-model, design, and review Harbor features that handle identity, tenants,
credentials, provider access, sensitive metadata, and asynchronous work.

## Principles

Deny by default; least privilege; organization scope from trusted context;
minimize and redact; assume external input is hostile; secure failure; rotate
and revoke; defense in depth; verify with adversarial tests.

## Required context

Feature actors/assets/data classes, trust/data-flow diagrams, auth/authorization
architecture, permissions, storage/lifecycle, external systems/scopes, jobs,
API/UI contracts, security checklist, and incident model.

## Workflow

1. Identify assets, actors, entry points, trust boundaries, and abuse cases.
2. Analyze authn/authz/IDOR, secrets, injection, CSRF/SSRF/XSS, redirect,
   replay/webhook, jobs, rate limits, supply chain, logs/backups, and deletion.
3. Define prevention, detection, response, rotation, and recovery.
4. Map controls to requirements and adversarial tests.
5. Rank residual risk and require explicit owner/acceptance.

## Output format

Threat model, data-flow/trust boundaries, findings by severity, control matrix,
test plan, incident/recovery needs, residual risk, and blocking decisions.

## Things to avoid

Security by UI, caller-owned tenant scope, secret logging/fixtures, raw provider
payloads, vague “sanitize input,” unlimited internal trust, permanent bypass,
unreviewed scopes, and unsupported claims of compliance.

## Quality checklist

- [ ] Assets/data and tenant boundaries are complete.
- [ ] Authentication, authorization, secrets, input/output, integrations, and
      jobs are covered.
- [ ] Controls include detection and recovery, not only prevention.
- [ ] Findings have evidence, severity, remediation, and tests.
- [ ] Residual risks have owners and explicit decisions.
