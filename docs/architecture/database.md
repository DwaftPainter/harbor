# Database architecture

Status: Draft

## Role

Neon PostgreSQL is Harbor's authoritative store for identities, organizations,
permissions, connections, synchronized projections, application groupings,
jobs, audit events, and preferences.

Providers remain authoritative for their external resource state. Harbor stores
the last observed representation plus provenance and freshness.

## Design rules

- Every tenant-owned row has an explicit organization owner or an unambiguous
  ownership path that queries cannot bypass.
- Foreign keys enforce structural relationships; domain services enforce
  contextual invariants.
- Timestamps use UTC and distinguish occurrence, observation, creation, update,
  deletion, and expiry.
- External identity uses provider connection + provider resource type +
  provider-native identifier.
- Provider metadata is bounded, versioned when needed, and scrubbed before
  persistence.
- Credentials are encrypted application payloads; searchable fingerprints and
  key versions are separate metadata.

## Access and transactions

Feature repositories own queries. Cross-feature reporting uses documented read
models rather than arbitrary table coupling. Transaction boundaries belong to
application use cases. The selected Neon/Drizzle driver must support the
transaction behavior required by each use case.

## Schema evolution

Drizzle schema definitions are reviewed with generated migrations. Production
migrations are forward-compatible, observable, and separated into expand,
backfill, switch, and contract steps when zero-downtime compatibility requires
it. Destructive changes require backup/restore evidence and an ADR when data
meaning changes materially.

See [database documentation](../database/README.md).
