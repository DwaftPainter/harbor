import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { resourceBindings } from "./applications";
import { providerConnections } from "./connections";
import { organizations } from "./organizations";

export const externalResources = pgTable(
  "external_resources",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    connectionId: text("connection_id")
      .notNull()
      .references(() => providerConnections.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(),
    resourceKind: text("resource_kind").notNull(), // 'project' | 'database' | 'service' | 'deployment' | 'storage' | 'domain'
    externalId: text("external_id").notNull(),
    name: text("name").notNull(),
    status: text("status"),
    normalizedStatus: text("normalized_status").notNull().default("unknown"), // 'running' | 'stopped' | 'provisioning' | 'degraded' | 'error' | 'unknown'
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    isStale: boolean("is_stale").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("external_resources_conn_kind_external_unique").on(
      table.connectionId,
      table.resourceKind,
      table.externalId,
    ),
    index("external_resources_org_kind_idx").on(
      table.organizationId,
      table.resourceKind,
    ),
    index("external_resources_org_status_idx").on(
      table.organizationId,
      table.normalizedStatus,
    ),
    index("external_resources_org_created_idx").on(
      table.organizationId,
      table.createdAt.desc(),
      table.id,
    ),
    index("external_resources_conn_stale_idx").on(
      table.connectionId,
      table.isStale,
    ),
  ],
);

export const resourceRelationships = pgTable(
  "resource_relationships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sourceResourceId: text("source_resource_id")
      .notNull()
      .references(() => externalResources.id, { onDelete: "cascade" }),
    targetResourceId: text("target_resource_id")
      .notNull()
      .references(() => externalResources.id, { onDelete: "cascade" }),
    relationshipType: text("relationship_type").notNull(), // 'parent_of' | 'depends_on' | 'deploys_to' | 'links_to'
    confidence: text("confidence").notNull().default("observed"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("resource_rel_unique").on(
      table.organizationId,
      table.sourceResourceId,
      table.targetResourceId,
      table.relationshipType,
    ),
    index("resource_rel_source_idx").on(
      table.organizationId,
      table.sourceResourceId,
    ),
    index("resource_rel_target_idx").on(
      table.organizationId,
      table.targetResourceId,
    ),
  ],
);

export const externalResourcesRelations = relations(
  externalResources,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [externalResources.organizationId],
      references: [organizations.id],
    }),
    connection: one(providerConnections, {
      fields: [externalResources.connectionId],
      references: [providerConnections.id],
    }),
    outgoingRelationships: many(resourceRelationships, {
      relationName: "outgoingRelationships",
    }),
    incomingRelationships: many(resourceRelationships, {
      relationName: "incomingRelationships",
    }),
    resourceBindings: many(resourceBindings),
  }),
);

export const resourceRelationshipsRelations = relations(
  resourceRelationships,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [resourceRelationships.organizationId],
      references: [organizations.id],
    }),
    sourceResource: one(externalResources, {
      fields: [resourceRelationships.sourceResourceId],
      references: [externalResources.id],
      relationName: "outgoingRelationships",
    }),
    targetResource: one(externalResources, {
      fields: [resourceRelationships.targetResourceId],
      references: [externalResources.id],
      relationName: "incomingRelationships",
    }),
  }),
);

export type ExternalResource = typeof externalResources.$inferSelect;
export type NewExternalResource = typeof externalResources.$inferInsert;
export type ResourceRelationship = typeof resourceRelationships.$inferSelect;
export type NewResourceRelationship = typeof resourceRelationships.$inferInsert;
