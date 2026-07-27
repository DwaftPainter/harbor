# API conventions

Status: Draft

Harbor uses resource-oriented HTTPS REST for its supported external API. Internal
Server Actions may serve UI mutations but must follow the same validation,
authorization, idempotency, error, and audit semantics.

- [REST and naming](rest-conventions.md)
- [Errors](errors.md)
- [Pagination and filtering](pagination-filtering.md)
- [Authentication and authorization](authentication-authorization.md)
- [Idempotency](idempotency.md)
- [Rate limiting](rate-limiting.md)
- [Versioning](versioning.md)

An OpenAPI document becomes required before Phase 15 implementation and is
generated or validated from the approved contract, not treated as a replacement
for feature specifications.
