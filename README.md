# Harbor

Harbor is a unified control plane for modern cloud applications. This
repository contains its production foundation: a Next.js App Router
application, shared dashboard shell, provider contracts, and the initial
authentication database schema.

Cloud provider integrations and authentication flows are intentionally not
implemented yet.

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

The dashboard is available at [http://localhost:3000](http://localhost:3000).
The placeholder dashboard routes do not require environment variables.

To work on database or authentication configuration, copy the environment
template and provide valid values:

```bash
cp .env.example .env.local
```

## Commands

```bash
pnpm dev           # Start the development server
pnpm build         # Create a production build
pnpm lint          # Run ESLint
pnpm typecheck     # Run strict TypeScript checks
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
