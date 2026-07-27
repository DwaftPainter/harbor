# ADR 0001 — Use Next.js App Router

Status: Accepted  
Date: 2026-07-27  
Deciders: Architecture team

## Context

Harbor needs a production React application with server-rendered authenticated
views, nested layouts, route-level loading/error behavior, server entry points,
and minimal browser JavaScript. One TypeScript deployment should serve the
initial modular monolith.

## Decision

Use the pinned Next.js App Router with `src/app`, React Server Components by
default, Route Handlers for HTTP boundaries, and narrow Client Components for
interactivity.

## Consequences

### Positive

- One supported full-stack React framework and deployment model.
- File-system routes, nested layouts, streaming boundaries, and route
  code-splitting align with Harbor's dashboard.
- Server Components keep secrets and most data access off the client.

### Negative

- Framework caching and server/client boundaries require explicit discipline.
- Upgrades may change conventions; repository-local Next.js documentation must
  be reviewed before changes.
- Long-running work still requires external worker execution.

### Risks and mitigations

- Tenant data cached incorrectly — default to request-scoped authenticated reads
  and document every cache decision.
- Client bundle growth — keep feature boundaries server-first and measure.
- Framework lock-in — keep domain/application services independent of Next.js.

## Alternatives considered

- React SPA plus separate API — more deployment and duplicated contract overhead.
- Remix — viable, but not aligned with the established foundation.
- Separate backend service initially — adds operational complexity without a
  proven scaling or ownership need.

## Validation

Build, security-boundary tests, route performance, bundle budgets, and ability to
run domain services outside route components.

## References

- [Frontend architecture](../architecture/frontend.md)
- [Backend architecture](../architecture/backend.md)
- [Next.js App Router documentation](https://nextjs.org/docs/app)
