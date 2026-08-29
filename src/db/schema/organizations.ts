import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { applications, environments, resourceBindings } from "./applications";
import { auditEvents } from "./audit";
import { user } from "./auth";
import { providerConnections } from "./connections";
import { externalResources, resourceRelationships } from "./resources";
import { discoveredResources, syncRuns } from "./sync";

export const organizations = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("organizations_slug_unique").on(table.slug),
    index("organizations_slug_idx").on(table.slug),
  ],
);

export const memberships = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // 'owner' | 'admin' | 'member' | 'viewer'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("memberships_org_user_unique").on(
      table.organizationId,
      table.userId,
    ),
    index("memberships_org_idx").on(table.organizationId),
    index("memberships_user_idx").on(table.userId),
  ],
);

export const invitations = pgTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull().default("member"),
    token: text("token").notNull(),
    status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'revoked' | 'expired'
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("invitations_token_unique").on(table.token),
    index("invitations_org_idx").on(table.organizationId),
    index("invitations_email_idx").on(table.email),
  ],
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  invitations: many(invitations),
  auditEvents: many(auditEvents),
  connections: many(providerConnections),
  syncRuns: many(syncRuns),
  discoveredResources: many(discoveredResources),
  externalResources: many(externalResources),
  resourceRelationships: many(resourceRelationships),
  applications: many(applications),
  environments: many(environments),
  resourceBindings: many(resourceBindings),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
  user: one(user, {
    fields: [memberships.userId],
    references: [user.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(user, {
    fields: [invitations.inviterId],
    references: [user.id],
  }),
}));
