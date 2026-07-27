# Security checklist

Status: Draft

## Identity and access

- [ ] Session/auth behavior follows the approved threat model.
- [ ] Organization context comes from active membership, not caller claims.
- [ ] Every operation has explicit permission and deny-by-default behavior.
- [ ] Sensitive delayed work revalidates current authority.

## Data protection

- [ ] Data is classified, minimized, and retention-defined.
- [ ] Credentials/tokens are encrypted or hashed appropriately and rotatable.
- [ ] Secrets never enter client bundles, URLs, logs, analytics, errors,
      notifications, fixtures, or audit metadata.
- [ ] Tenant ownership is constrained in every query and relationship.

## Input and output

- [ ] Inputs, identifiers, URLs, redirects, files, webhooks, and external payloads
      are schema-validated and bounded.
- [ ] Output encoding and content security controls address injection.
- [ ] SSRF, open redirect, CSRF, replay, enumeration, and timing risks are
      considered where applicable.

## Integrations and jobs

- [ ] Provider scopes are least privilege and revocable.
- [ ] External calls have timeouts, classified retries, and rate-limit handling.
- [ ] Jobs are idempotent, versioned, payload-minimal, and observable.
- [ ] Webhooks verify signature, freshness, size, and delivery identity.

## Supply chain and operations

- [ ] Dependencies and updates are reviewed; lockfile is committed.
- [ ] Security headers, TLS, backup encryption, key rotation, and access logs are
      configured.
- [ ] Alerts, incident response, rollback, restore, and credential compromise
      procedures are tested.
- [ ] Residual risk has an owner and explicit acceptance.
