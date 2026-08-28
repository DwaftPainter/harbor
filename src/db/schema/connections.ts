import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { organizations } from "./organizations";
import { externalResources } from "./resources";
import { discoveredResources, syncRuns } from "./sync";

export const providerConnections = pgTable(
  "provider_connections",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(), // 'neon' | 'vercel' | 'render' | 'supabase' | 'railway' | 'cloudflare'
    name: text("name").notNull(),
    status: text("status").notNull().default("connected"), // 'connected' | 'validating' | 'degraded' | 'revoked' | 'disabled'
    externalAccountId: text("external_account_id"),
    externalAccountName: text("external_account_name"),
    scope: text("scope"),
    lastValidatedAt: timestamp("last_validated_at", {
      withTimezone: true,
      mode: "date",
    }),
    lastSyncAt: timestamp("last_sync_at", {
      withTimezone: true,
      mode: "date",
    }),
    errorSummary: text("error_summary"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("provider_connections_org_provider_idx").on(
      table.organizationId,
      table.providerId,
    ),
    index("provider_connections_org_created_idx").on(
      table.organizationId,
      table.createdAt.desc(),
    ),
  ],
);

export const connectionCredentials = pgTable(
  "connection_credentials",
  {
    id: text("id").primaryKey(),
    connectionId: text("connection_id")
      .notNull()
      .unique()
      .references(() => providerConnections.id, { onDelete: "cascade" }),
    encryptedData: text("encrypted_data").notNull(),
    iv: text("iv").notNull(),
    authTag: text("auth_tag").notNull(),
    keyVersion: text("key_version").notNull().default("v1"),
    fingerprint: text("fingerprint").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("connection_credentials_connection_id_idx").on(table.connectionId),
  ],
);

export const providerConnectionsRelations = relations(
  providerConnections,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [providerConnections.organizationId],
      references: [organizations.id],
    }),
    credential: one(connectionCredentials, {
      fields: [providerConnections.id],
      references: [connectionCredentials.connectionId],
    }),
    syncRuns: many(syncRuns),
    discoveredResources: many(discoveredResources),
    externalResources: many(externalResources),
  }),
);

export const connectionCredentialsRelations = relations(
  connectionCredentials,
  ({ one }) => ({
    connection: one(providerConnections, {
      fields: [connectionCredentials.connectionId],
      references: [providerConnections.id],
    }),
  }),
);

export type ProviderConnection = typeof providerConnections.$inferSelect;
export type NewProviderConnection = typeof providerConnections.$inferInsert;
export type ConnectionCredential = typeof connectionCredentials.$inferSelect;
export type NewConnectionCredential = typeof connectionCredentials.$inferInsert;
