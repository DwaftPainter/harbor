# Harbor

Harbor is a unified control plane for modern cloud applications. This
repository contains its production foundation, Better Auth identity and session
entry points, a shared dashboard shell, provider contracts, and the
authentication database schema.

Cloud provider integrations are intentionally not implemented yet.

## Requirements

- Node.js 20 or newer
- pnpm 11
- PostgreSQL when running migrations or authentication-backed features

## Local development

Install dependencies and start the application:

```bash
pnpm install
pnpm dev
```

Copy the environment template, provide valid values, migrate the database, and
then start the application:

```bash
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

Create an account at
[http://localhost:3000/sign-up](http://localhost:3000/sign-up). The dashboard
requires an authenticated session.

## Commands

```bash
pnpm dev           # Start the development server
pnpm build         # Create a production build
pnpm lint          # Run ESLint
pnpm typecheck     # Run strict TypeScript checks
pnpm test          # Run deterministic foundation tests
pnpm docs:check    # Validate documentation metadata, shape, and links
pnpm check         # Run every non-build CI quality gate
pnpm format:check  # Check Prettier formatting
pnpm db:generate   # Generate migrations from the Drizzle schema
pnpm db:migrate    # Apply pending migrations
pnpm db:studio     # Open Drizzle Studio
```

## Structure

```text
src/
├── app/          # App Router routes and layouts
├── components/   # Shared layout and UI components
├── config/       # Application configuration
├── db/           # Drizzle client, schema, and migrations
├── features/     # Feature-owned components and modules
├── hooks/        # Shared React hooks
├── lib/          # Framework and library configuration
├── providers/    # Cloud provider contracts and adapters
└── types/        # Shared TypeScript types
```

Server Components are the default. Client boundaries are limited to features
that need browser state, currently active navigation and TanStack Query.

## Operations

- `GET /api/health/live` reports process liveness without touching dependencies.
- `GET /api/health/ready` reports whether configuration and PostgreSQL are ready.
- Server startup and request failures are written as structured JSON without
  request headers, query strings, exception messages, or secrets.
- The production container is defined by `Dockerfile` and runs as a non-root
  user.

See the
[foundation operations guide](docs/guides/foundation-operations.md) for the
environment matrix, deployment sequence, health checks, migrations, and
rollback procedure.
