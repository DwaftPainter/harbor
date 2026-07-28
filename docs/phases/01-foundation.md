# Phase 01 — Foundation

Status: Approved
Estimated complexity: Medium

## Objective

Create a secure, deployable, testable project baseline without product business
logic.

## Scope

Project structure, environments, configuration validation, CI, deployment
topology, database migration workflow, UI shell, telemetry baseline, quality
gates, and operational ownership.

## Prerequisites

- Phase 00 complete.
- Core technology ADRs approved.

## Entry criteria

- Environment matrix and quality standards are approved.

## Deliverables

- Reproducible local and CI workflows.
- Strict type, lint, format, build, and test gates.
- Environment validation and secret-handling policy.
- Initial deployment and observability baselines.
- Architecture-conformant feature and provider boundaries.

## Implementation order

1. Toolchain and directory boundaries.
2. Environment and secret configuration.
3. Database and migration pipeline.
4. UI shell and error/loading boundaries.
5. CI, telemetry, deployment, and recovery verification.

## Documents required

- Frontend, backend, and database architecture
- Folder, testing, security, and Definition of Done standards
- Environment and deployment guides

## Completion checklist

- [x] Fresh install, development, checks, and production build are reproducible.
- [x] No secret enters client bundles, logs, or source control.
- [x] Migration generation and application responsibilities are documented.
- [x] Basic health and error telemetry are observable.
- [x] No unused product abstraction or demo data exists.

## Evidence

- `package.json`, the frozen lockfile, and the quality workflow pin the supported
  toolchain and run documentation, lint, type, test, format, and build gates.
- Server-only environment validation and the structured logger keep secrets out
  of browser bundles and operational events.
- The foundation operations guide defines environment, migration, deployment,
  health, telemetry, rollback, and restore responsibilities.
- Liveness and dependency-aware readiness routes provide uncached probe
  contracts; Next.js instrumentation captures startup and request failures.
- The standalone non-root container and accessible error/not-found boundaries
  establish the production runtime and recovery UI baseline.

## Approval

Approved by the product owner on 2026-07-28 to begin Phase 02. Approval accepts
the foundation implementation and carries the following production-like
validation forward as named operational follow-up; it does not claim that the
checks were executed.

## Remaining operational evidence

- Build and start the container on a host with a running Docker daemon.
- Confirm readiness returns 200 against an isolated PostgreSQL database.
- Exercise traffic rollback between two compatible image versions.

The standalone production server, liveness 200 response, dependency-failure
readiness 503 response, security headers, and safe readiness telemetry have been
verified locally. The remaining checks require external runtime dependencies
and remain required before production launch.

## Exit criteria

A production-like deployment can be built, observed, and rolled back, and later
phases can add features without restructuring the foundation.
