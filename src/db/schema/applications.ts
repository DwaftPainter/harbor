import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations";
import { externalResources } from "./resources";

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    isArchived: boolean("is_archived").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("applications_org_slug_unique").on(table.organizationId, table.slug),
    index("applications_org_archived_idx").on(
      table.organizationId,
      table.isArchived,
    ),
    index("applications_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
  ],
);

export const environments = pgTable(
  "environments",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    classification: text("classification").notNull().default("custom"), // 'production' | 'staging' | 'preview' | 'development' | 'custom'
    isProduction: boolean("is_production").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    isArchived: boolean("is_archived").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("environments_app_slug_unique").on(table.applicationId, table.slug),
    index("environments_app_order_idx").on(
      table.applicationId,
      table.orderIndex,
    ),
    index("environments_org_idx").on(table.organizationId),
  ],
);

export const resourceBindings = pgTable(
  "resource_bindings",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    environmentId: text("environment_id")
      .notNull()
      .references(() => environments.id, { onDelete: "cascade" }),
    resourceId: text("resource_id")
      .notNull()
      .references(() => externalResources.id, { onDelete: "cascade" }),
    bindingSource: text("binding_source").notNull().default("manual"), // 'manual' | 'suggested' | 'auto_inferred'
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("resource_bindings_env_resource_unique").on(
      table.environmentId,
      table.resourceId,
    ),
    index("resource_bindings_app_idx").on(table.applicationId),
    index("resource_bindings_res_idx").on(table.resourceId),
    index("resource_bindings_org_idx").on(table.organizationId),
  ],
);

// Relations
export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [applications.organizationId],
      references: [organizations.id],
    }),
    environments: many(environments),
    resourceBindings: many(resourceBindings),
  }),
);

export const environmentsRelations = relations(
  environments,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [environments.organizationId],
      references: [organizations.id],
    }),
    application: one(applications, {
      fields: [environments.applicationId],
      references: [applications.id],
    }),
    resourceBindings: many(resourceBindings),
  }),
);

export const resourceBindingsRelations = relations(
  resourceBindings,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [resourceBindings.organizationId],
      references: [organizations.id],
    }),
    application: one(applications, {
      fields: [resourceBindings.applicationId],
      references: [applications.id],
    }),
    environment: one(environments, {
      fields: [resourceBindings.environmentId],
      references: [environments.id],
    }),
    resource: one(externalResources, {
      fields: [resourceBindings.resourceId],
      references: [externalResources.id],
    }),
  }),
);
