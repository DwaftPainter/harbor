import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { providerConnections } from "./connections";
import { organizations } from "./organizations";

export const syncRuns = pgTable(
  "sync_runs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    connectionId: text("connection_id")
      .notNull()
      .references(() => providerConnections.id, { onDelete: "cascade" }),
    capability: text("capability").notNull().default("full"), // 'projects' | 'deployments' | 'databases' | 'full'
    trigger: text("trigger").notNull().default("manual"), // 'manual' | 'scheduled' | 'webhook'
    triggeredById: text("triggered_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("queued"), // 'queued' | 'running' | 'succeeded' | 'partially_succeeded' | 'failed' | 'cancelled'
    leaseToken: text("lease_token"),
    leaseExpiresAt: timestamp("lease_expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    cursor: text("cursor"),
    itemsObserved: integer("items_observed").notNull().default(0),
    itemsCreated: integer("items_created").notNull().default(0),
    itemsUpdated: integer("items_updated").notNull().default(0),
    itemsStale: integer("items_stale").notNull().default(0),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "date",
    }),
    finishedAt: timestamp("finished_at", {
      withTimezone: true,
      mode: "date",
    }),
    errorSummary: text("error_summary"),
    errorCategory: text("error_category"), // 'auth' | 'rate_limit' | 'timeout' | 'schema' | 'transient' | 'fatal'
    retryCount: integer("retry_count").notNull().default(0),
    nextRetryAt: timestamp("next_retry_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sync_runs_org_created_idx").on(
      table.organizationId,
      table.createdAt.desc(),
    ),
    index("sync_runs_connection_status_idx").on(
      table.connectionId,
      table.status,
    ),
    index("sync_runs_lease_token_idx").on(table.leaseToken),
    index("sync_runs_connection_capability_idx").on(
      table.connectionId,
      table.capability,
    ),
  ],
);

export const discoveredResources = pgTable(
  "discovered_resources",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    connectionId: text("connection_id")
      .notNull()
      .references(() => providerConnections.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(),
    resourceKind: text("resource_kind").notNull(), // 'project' | 'database' | 'service' | 'deployment'
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    status: text("status"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    isStale: boolean("is_stale").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("discovered_resources_conn_kind_external_unique").on(
      table.connectionId,
      table.resourceKind,
      table.externalId,
    ),
    index("discovered_resources_org_kind_idx").on(
      table.organizationId,
      table.resourceKind,
    ),
    index("discovered_resources_conn_stale_idx").on(
      table.connectionId,
      table.isStale,
    ),
  ],
);

export const syncRunsRelations = relations(syncRuns, ({ one }) => ({
  organization: one(organizations, {
    fields: [syncRuns.organizationId],
    references: [organizations.id],
  }),
  connection: one(providerConnections, {
    fields: [syncRuns.connectionId],
    references: [providerConnections.id],
  }),
  triggeredBy: one(user, {
    fields: [syncRuns.triggeredById],
    references: [user.id],
  }),
}));

export const discoveredResourcesRelations = relations(
  discoveredResources,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [discoveredResources.organizationId],
      references: [organizations.id],
    }),
    connection: one(providerConnections, {
      fields: [discoveredResources.connectionId],
      references: [providerConnections.id],
    }),
  }),
);

export type SyncRun = typeof syncRuns.$inferSelect;
export type NewSyncRun = typeof syncRuns.$inferInsert;
export type DiscoveredResource = typeof discoveredResources.$inferSelect;
export type NewDiscoveredResource = typeof discoveredResources.$inferInsert;
