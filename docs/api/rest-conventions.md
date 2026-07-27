# REST and naming conventions

Status: Draft

## Transport

- HTTPS only; JSON request and response bodies unless a documented export uses
  another media type.
- UTF-8 and ISO 8601 UTC timestamps.
- Request and correlation identifiers are returned in response headers.
- Clients declare accepted API version according to the versioning policy.

## Resources

- Use plural lowercase kebab-case nouns: `/organizations`,
  `/provider-connections`, `/sync-runs`.
- Scope tenant resources beneath organizations when that makes ownership
  explicit: `/organizations/{organizationId}/applications`.
- Avoid RPC verbs in paths. Use subresources for meaningful operations, such as
  a validation attempt or sync run.
- Identifiers are opaque strings; clients never infer type or ordering.
- JSON properties use camelCase.
- Enum strings use lowercase snake_case and are closed unless documented as
  extensible.

## Methods

- `GET`: safe read, no state mutation.
- `POST`: create a resource or operation; idempotency required for retryable
  client submissions.
- `PATCH`: partial update of documented mutable fields.
- `PUT`: complete replacement only when the feature genuinely supports it.
- `DELETE`: remove, revoke, or schedule deletion according to resource policy.

## Responses

- Creation returns the created representation or accepted operation.
- Asynchronous work returns an operation resource and status location.
- Deletion behavior distinguishes immediate removal, revocation, and accepted
  asynchronous deletion.
- Empty collections return an empty `data` array, not not-found.
- Field absence and explicit `null` have documented, different meanings.

## Compatibility

Response fields may be added compatibly. Clients must ignore unknown fields.
Changing meaning, type, required input, enum closure, default behavior, or
authorization is a compatibility review.
