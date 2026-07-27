# Rate limiting

Status: Draft

## Objectives

Protect authentication, tenant fairness, database capacity, worker capacity,
external provider quotas, and expensive search/export paths.

## Dimensions

Limits may apply by IP, unauthenticated identifier fingerprint, user, API
credential, organization, endpoint class, provider connection, and provider
quota bucket. Sensitive identifiers are hashed or minimized in limiter keys.

## Response

Harbor returns a stable 429 error plus standard limit, remaining, reset, and
retry guidance where accurate. Limits must not reveal whether an account or
tenant exists.

## Provider-aware limits

Provider adapter observations feed scheduling. A provider 429 delays relevant
connection work with jitter and reset awareness; it does not cause immediate
request amplification or global starvation.

## Policy

- Authentication and verification routes have conservative abuse limits.
- Read APIs have documented burst and sustained limits.
- Expensive operations have concurrency and frequency limits.
- Internal service identities are not unlimited; they use separate budgets.
- Administrative bypass is narrow, expiring, authorized, and audited.

Exact values are configuration owned by operations and validated through load
testing before launch.
