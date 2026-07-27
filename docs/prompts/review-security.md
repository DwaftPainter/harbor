# Prompt — Review security

```text
Perform a Harbor security review for [feature/change].

Threat surface and data classes: [details]
Approved feature/architecture/security docs: [links]
Actors, organizations, permissions, and external systems: [details]

Load docs/skills/security.skill.md and review.skill.md. Analyze authentication,
tenant isolation, authorization, IDOR, secret/token lifecycle, input/output,
CSRF, SSRF, XSS, redirects, replay, webhooks, jobs, provider scopes, logs/audit,
rate limits, dependencies, deletion, backup, and incident recovery as applicable.

Report findings by severity with attack preconditions, impact, evidence, violated
requirement, remediation, and verification. List residual risk and required
threat-model/doc updates. Do not expose real secrets, exploit external systems,
or claim safety without evidence.
```
