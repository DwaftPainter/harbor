# Pagination and filtering

Status: Draft

## Pagination

Mutable collections use opaque cursor pagination. Requests accept `pageSize` and
an optional `pageCursor`. Responses contain:

- `data`: ordered resources;
- `page.nextCursor`: opaque cursor or null;
- `page.hasMore`: whether another page is known;
- optional totals only where they are accurate and affordable.

Default and maximum page sizes are documented per resource class. Invalid,
expired, wrong-tenant, or filter-mismatched cursors return a stable validation
error.

Ordering includes a unique tie-breaker. Cursors encode or reference versioned
ordering state and are integrity-protected where exposure could permit
tampering.

## Filtering

- Filters use explicit query parameters with documented types and operators.
- Repeated parameters represent a documented OR set; different filter fields
  combine with AND unless specified.
- Date ranges define inclusive/exclusive boundaries.
- Text search is distinct from exact filtering.
- Unknown fields/operators are rejected.
- Filters are allowlisted and organization authorization is always applied
  independently.

## Sorting

Sort fields are allowlisted. Prefix `-` denotes descending only if adopted by
the endpoint contract. A deterministic default is always documented.

## Limits

Query complexity, filter list length, date range, and search input length are
bounded. Arbitrary expression languages are out of scope.
