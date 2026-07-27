# Error responses

Status: Draft

## Envelope

Every error contains:

| Field             | Meaning                             |
| ----------------- | ----------------------------------- |
| `error.code`      | Stable machine-readable code        |
| `error.message`   | Safe human summary                  |
| `error.details`   | Optional bounded structured details |
| `error.requestId` | Correlation identifier for support  |

Validation details identify safe field paths and stable reasons without echoing
secrets. Stack traces, SQL, credentials, provider response bodies, and internal
topology never appear.

## Status mapping

| Status      | Category                                              |
| ----------- | ----------------------------------------------------- |
| 400         | Malformed request or invalid state-independent input  |
| 401         | Missing or invalid authentication                     |
| 403         | Authenticated but not permitted                       |
| 404         | Resource absent or intentionally concealed            |
| 409         | State conflict, uniqueness, or idempotency conflict   |
| 422         | Well-formed input violates domain validation          |
| 429         | Harbor or provider-aware rate limit                   |
| 500         | Unexpected internal failure                           |
| 502/503/504 | Classified upstream or temporary availability failure |

## Rules

- Error codes are documented per feature and are versioned contracts.
- Authorization concealment consistently chooses forbidden or not-found for a
  resource class.
- Provider failures are translated to Harbor categories while safe provider
  request identifiers may be retained for support.
- Retryable responses state retry guidance through headers where applicable.
- Multiple validation failures are deterministic and bounded.
