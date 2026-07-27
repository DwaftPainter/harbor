# Phase 10 — Configuration metadata

Status: Draft  
Estimated complexity: Very high

## Objective

Show useful environment-variable and configuration metadata without exposing
secret values.

## Scope

Variable names, scope, environment, provider provenance, presence, drift,
sensitivity classification, access policy, comparison UI, and redaction.

## Prerequisites

- Phase 08 complete.
- Provider scopes can read configuration metadata safely.

## Entry criteria

- Secret threat model and strict no-value persistence policy are approved.

## Deliverables

- Metadata-only configuration inventory.
- Presence and name comparison across environments.
- Sensitive-name classification and universal redaction.
- Permissioned, audited access to configuration metadata.

## Implementation order

1. Threat-model all provider payloads and logs.
2. Define allowlisted metadata contract.
3. Implement provider-specific scrubbing before persistence.
4. Add comparison UI and permissions.
5. Run secret canary, logging, cache, export, and support tests.

## Documents required

- Environment-variables and secrets feature
- Security architecture/checklist
- Data lifecycle, provider mapping, and audit requirements

## Completion checklist

- [ ] Secret values are neither requested nor retained where provider APIs allow.
- [ ] Accidental values are scrubbed before persistence and telemetry.
- [ ] Names and presence have explicit permissions.
- [ ] Exports, errors, analytics, and caches preserve redaction.
- [ ] Drift does not imply automated provider changes.

## Exit criteria

Users can compare configuration structure safely, with evidence that Harbor
cannot reveal stored secret values through supported paths.
