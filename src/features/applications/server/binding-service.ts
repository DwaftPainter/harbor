import { and, eq } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import {
  applications,
  environments,
  resourceBindings,
} from "@/db/schema/applications";
import { externalResources } from "@/db/schema/resources";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";
import type {
  ExternalResourceDTO,
  NormalizedResourceStatus,
  ResourceKind,
} from "@/features/resources/types";

import type {
  BindingSource,
  BindingSuggestionDTO,
  BindResourceInput,
  EnvironmentClassification,
  EnvironmentDTO,
  ResourceBindingDTO,
} from "../types";
import { generateBindingSuggestions } from "./suggestion-rules";

function toExternalResourceDTO(
  row: typeof externalResources.$inferSelect,
): ExternalResourceDTO {
  return {
    id: row.id,
    organizationId: row.organizationId,
    connectionId: row.connectionId,
    providerId: row.providerId,
    resourceKind: row.resourceKind as ResourceKind,
    externalId: row.externalId,
    name: row.name,
    status: row.status,
    normalizedStatus: row.normalizedStatus as NormalizedResourceStatus,
    metadata: row.metadata || {},
    lastSeenAt: row.lastSeenAt.toISOString(),
    isStale: row.isStale,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toEnvironmentDTO(
  row: typeof environments.$inferSelect,
): EnvironmentDTO {
  return {
    id: row.id,
    organizationId: row.organizationId,
    applicationId: row.applicationId,
    name: row.name,
    slug: row.slug,
    classification: row.classification as EnvironmentClassification,
    isProduction: row.isProduction,
    orderIndex: row.orderIndex,
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Lists resource bindings for an application (optionally filtered by environment).
 */
export async function listBindings(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  environmentId?: string,
  db: AppDb = getDb(),
): Promise<ResourceBindingDTO[]> {
  await requirePermission(organizationId, actorUserId, "application:read", db);

  const conditions = [
    eq(resourceBindings.organizationId, organizationId),
    eq(resourceBindings.applicationId, applicationId),
  ];

  if (environmentId) {
    conditions.push(eq(resourceBindings.environmentId, environmentId));
  }

  const rows = await db
    .select({
      binding: resourceBindings,
      resource: externalResources,
      environment: environments,
    })
    .from(resourceBindings)
    .innerJoin(
      externalResources,
      eq(resourceBindings.resourceId, externalResources.id),
    )
    .innerJoin(
      environments,
      eq(resourceBindings.environmentId, environments.id),
    )
    .where(and(...conditions));

  return rows.map(({ binding, resource, environment }) => ({
    id: binding.id,
    organizationId: binding.organizationId,
    applicationId: binding.applicationId,
    environmentId: binding.environmentId,
    resourceId: binding.resourceId,
    bindingSource: binding.bindingSource as BindingSource,
    isPrimary: binding.isPrimary,
    createdAt: binding.createdAt.toISOString(),
    updatedAt: binding.updatedAt.toISOString(),
    resource: toExternalResourceDTO(resource),
    environment: toEnvironmentDTO(environment),
  }));
}

/**
 * Binds an external resource to an application environment.
 * Rejects cross-tenant bindings and ensures environment/application ownership match.
 */
export async function bindResource(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  input: BindResourceInput,
  db: AppDb = getDb(),
): Promise<ResourceBindingDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "application:update",
    db,
  );

  // 1. Verify environment belongs to application and organization
  const [envRow] = await db
    .select()
    .from(environments)
    .where(
      and(
        eq(environments.id, input.environmentId),
        eq(environments.applicationId, applicationId),
        eq(environments.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!envRow) {
    throw new Error("Invalid target environment for this application");
  }

  // 2. Verify external resource belongs to the SAME organization
  const [resRow] = await db
    .select()
    .from(externalResources)
    .where(
      and(
        eq(externalResources.id, input.resourceId),
        eq(externalResources.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!resRow) {
    throw new Error(
      "Resource not found or does not belong to this organization",
    );
  }

  // 3. If setting primary, unset isPrimary on other resources in the environment
  if (input.isPrimary) {
    await db
      .update(resourceBindings)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(
        and(
          eq(resourceBindings.environmentId, input.environmentId),
          eq(resourceBindings.organizationId, organizationId),
        ),
      );
  }

  const bindingId = crypto.randomUUID();

  const [bindingRow] = await db
    .insert(resourceBindings)
    .values({
      id: bindingId,
      organizationId,
      applicationId,
      environmentId: input.environmentId,
      resourceId: input.resourceId,
      bindingSource: input.bindingSource || "manual",
      isPrimary: input.isPrimary || false,
    })
    .onConflictDoUpdate({
      target: [resourceBindings.environmentId, resourceBindings.resourceId],
      set: {
        bindingSource: input.bindingSource || "manual",
        isPrimary: input.isPrimary || false,
        updatedAt: new Date(),
      },
    })
    .returning();

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "resource.bound",
      targetType: "resource_binding",
      targetId: bindingRow!.id,
      outcome: "success",
      metadata: {
        applicationId,
        environmentId: input.environmentId,
        resourceId: input.resourceId,
        resourceName: resRow.name,
        environmentName: envRow.name,
        bindingSource: bindingRow!.bindingSource,
      },
    },
    db,
  );

  return {
    id: bindingRow!.id,
    organizationId: bindingRow!.organizationId,
    applicationId: bindingRow!.applicationId,
    environmentId: bindingRow!.environmentId,
    resourceId: bindingRow!.resourceId,
    bindingSource: bindingRow!.bindingSource as BindingSource,
    isPrimary: bindingRow!.isPrimary,
    createdAt: bindingRow!.createdAt.toISOString(),
    updatedAt: bindingRow!.updatedAt.toISOString(),
    resource: toExternalResourceDTO(resRow),
    environment: toEnvironmentDTO(envRow),
  };
}

/**
 * Unbinds a resource from an environment.
 */
export async function unbindResource(
  organizationId: string,
  bindingId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<void> {
  await requirePermission(
    organizationId,
    actorUserId,
    "application:update",
    db,
  );

  const [deleted] = await db
    .delete(resourceBindings)
    .where(
      and(
        eq(resourceBindings.id, bindingId),
        eq(resourceBindings.organizationId, organizationId),
      ),
    )
    .returning();

  if (!deleted) throw new Error("Resource binding not found");

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "resource.unbound",
      targetType: "resource_binding",
      targetId: bindingId,
      outcome: "success",
      metadata: {
        applicationId: deleted.applicationId,
        environmentId: deleted.environmentId,
        resourceId: deleted.resourceId,
      },
    },
    db,
  );
}

/**
 * Evaluates deterministic binding suggestions for an application without silent mutation.
 */
export async function getBindingSuggestions(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<BindingSuggestionDTO[]> {
  await requirePermission(organizationId, actorUserId, "application:read", db);

  const [appRow] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!appRow) return [];

  const envRows = await db
    .select()
    .from(environments)
    .where(
      and(
        eq(environments.applicationId, applicationId),
        eq(environments.isArchived, false),
      ),
    )
    .orderBy(environments.orderIndex);

  // Get currently bound resource IDs in this org
  const existingBindings = await db
    .select({ resourceId: resourceBindings.resourceId })
    .from(resourceBindings)
    .where(eq(resourceBindings.organizationId, organizationId));

  const boundResourceIds = new Set(existingBindings.map((b) => b.resourceId));

  // Get all active external resources for this organization
  const allResources = await db
    .select()
    .from(externalResources)
    .where(
      and(
        eq(externalResources.organizationId, organizationId),
        eq(externalResources.isStale, false),
      ),
    );

  const candidateResources = allResources
    .filter((r) => !boundResourceIds.has(r.id))
    .map(toExternalResourceDTO);

  return generateBindingSuggestions(
    { name: appRow.name, slug: appRow.slug },
    envRows.map(toEnvironmentDTO),
    candidateResources,
    boundResourceIds,
  );
}
