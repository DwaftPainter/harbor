# Foundation operations

Status: Implemented

## Purpose

Define the Phase 01 environment, deployment, health, migration, observability,
rollback, and recovery contract. The platform operator owns this procedure.

## Environment matrix

| Environment | Build source        | Data                           | Availability expectation |
| ----------- | ------------------- | ------------------------------ | ------------------------ |
| Local       | Developer checkout  | Local or isolated Neon branch  | Best effort              |
| Preview     | Pull-request commit | Disposable isolated database   | Best effort              |
| Production  | Tagged commit       | Production Neon project/branch | Monitored                |

The same immutable container image moves through preview and production. Only
runtime configuration differs. Preview and production secrets come from the
deployment platform, never build arguments, repository variables, image
layers, or committed environment files.

Required runtime variables:

| Variable                   | Classification | Purpose                                     |
| -------------------------- | -------------- | ------------------------------------------- |
| `DATABASE_URL`             | Secret         | PostgreSQL connection URL                   |
| `BETTER_AUTH_SECRET`       | Secret         | Better Auth signing/encryption secret       |
| `BETTER_AUTH_URL`          | Public config  | Canonical same-origin application URL       |
| `BETTER_AUTH_API_KEY`      | Secret         | Better Auth dashboard ownership and API key |
| `RESEND_API_KEY`           | Secret         | Transactional authentication email delivery |
| `AUTH_EMAIL_FROM`          | Public config  | Verified authentication sender identity     |
| `UPSTASH_REDIS_REST_URL`   | Secret         | Shared authentication rate-limit store      |
| `UPSTASH_REDIS_REST_TOKEN` | Secret         | Shared rate-limit store credential          |
| `APP_VERSION`              | Public config  | Immutable commit or release identity        |

Only variables prefixed with `NEXT_PUBLIC_` may enter browser bundles. Harbor
currently defines none.

## Quality and build

CI uses Node 20, pnpm 11.1.3, a frozen lockfile, and read-only repository
permissions. `pnpm check` validates documentation, lint, types, tests, and
formatting. `pnpm build` uses Next.js 16's supported webpack production path to
create the standalone output; development retains the default Turbopack path.

Build the container with:

```bash
docker build --tag harbor:<commit> .
```

The final image contains only the standalone Next.js server, static assets, and
production runtime files. It runs as the unprivileged `nextjs` user on port 3000.

## Database migrations

The deployment pipeline has one explicit migration responsibility. Before
shifting traffic to a release that requires a new schema, an authorized
operator runs:

```bash
pnpm db:migrate
```

Application startup never pushes or generates schema. A migration failure stops
the rollout before traffic changes. Applied migrations are not reversed or
edited; rollback uses a previous compatible application image. Destructive
schema contraction happens only in a later release after compatibility and
recovery evidence.

## Deployment

1. Run the quality and production build gates.
2. Build and identify one immutable image with `APP_VERSION`.
3. Apply reviewed, backward-compatible migrations once.
4. Start the new image with runtime secrets.
5. Wait for `/api/health/live` and `/api/health/ready`.
6. Send a small traffic slice and inspect structured `request.failed` events.
7. Promote traffic only while readiness and the error budget remain healthy.
8. Retain the previous image until the observation window ends.

`/api/health/live` proves that the web process responds. It does not inspect
configuration or external dependencies. `/api/health/ready` validates server
configuration and runs a minimal PostgreSQL query. Both responses disable
caching; readiness returns HTTP 503 without exposing failure details when a
dependency is unavailable.

## Telemetry

Every server instance writes `application.started` with runtime and version.
Unhandled server request failures write `request.failed` with method,
query-free path, route, route type, and an opaque digest when available.
Readiness failures write `health.readiness_failed`.

Sensitive authentication outcomes write allowlisted `auth.*` events containing
only method, status, duration, and success or failure. They never include
addresses, credentials, cookies, request bodies, links, or challenge material.

Logs are JSON on standard output for collection by the deployment platform.
They intentionally omit request headers, cookies, bodies, query strings, error
messages, stack traces, database URLs, tokens, and user data. Alerting should
cover sustained readiness failure, restart loops, and an elevated rate of
`request.failed`.

## Rollback and recovery

To roll back, stop promotion, route traffic to the retained previous image, and
verify both health endpoints. Do not reverse an already-applied compatible
migration. If the previous image is not schema-compatible, roll forward with a
corrected image.

For database corruption or accidental destructive change, stop writes, preserve
logs and release identifiers, and follow the Neon restore procedure into a new
branch before switching application traffic. Record timestamps, image version,
migration journal state, restore point, validation queries, and the approving
operator in the incident record.

## Verification

- `pnpm check`
- `pnpm build`
- `docker build --tag harbor:verification .`
- Start the image with isolated runtime configuration.
- Confirm liveness returns 200 without a database.
- Confirm readiness returns 200 with PostgreSQL and 503 without it.
- Exercise deployment rollback by switching between two compatible image tags.
