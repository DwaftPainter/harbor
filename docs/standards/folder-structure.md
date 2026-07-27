# Folder structure

Status: Draft

## Repository

```text
docs/               Authoritative project documentation
public/             Static web assets
src/app/            Next.js routes, layouts, and entry points
src/components/     Domain-neutral shared UI
src/config/         Static application configuration
src/db/             Database client, schema, and migrations
src/features/       Feature-owned implementation
src/hooks/          Genuinely shared React hooks
src/lib/            Narrow library/framework configuration
src/providers/      Provider contracts and adapters
src/types/          Genuinely shared types
skills/             Pointer/adapters to canonical docs skills
```

## Feature module

A feature may contain `components`, `server`, `schemas`, `queries`,
`repositories`, `types`, and tests when it currently needs them. Do not create
empty folders or barrels in anticipation.

## Dependency rules

- `app` composes feature entry points.
- Feature modules may use shared components/lib and explicit core contracts.
- Shared folders do not import product features.
- Provider implementations depend on provider/core contracts, not the reverse.
- Client modules cannot import server-only, database, credential, or provider
  implementation modules.
- Cross-feature imports use documented public entry points and must not form
  cycles.
- Files stay small enough to express one responsibility; splitting follows
  cohesion, not line-count theater.

## Placement decision

Put behavior in the feature that owns its invariant. Promote to shared only when
multiple current features use the same semantics and ownership is neutral.
