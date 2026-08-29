import { and, desc, eq, ilike, sql } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import {
  applications,
  environments,
  resourceBindings,
} from "@/db/schema/applications";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";
import { slugify } from "@/features/organizations/slug";

import {
  type ApplicationDTO,
  type ApplicationDetailDTO,
  type CreateApplicationInput,
  DEFAULT_ENVIRONMENTS,
  type EnvironmentClassification,
  type EnvironmentDTO,
  type UpdateApplicationInput,
} from "../types";

function toApplicationDTO(
  row: typeof applications.$inferSelect,
): ApplicationDTO {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    isArchived: row.isArchived,
    archivedAt: row.archivedAt?.toISOString() ?? null,
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

export async function generateUniqueApplicationSlug(
  organizationId: string,
  baseText: string,
  db: AppDb = getDb(),
): Promise<string> {
  const baseSlug = slugify(baseText);
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.organizationId, organizationId),
          eq(applications.slug, candidateSlug),
        ),
      )
      .limit(1);

    if (!existing) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Lists applications in an organization with environment and bound resource summaries.
 */
export async function listApplications(
  organizationId: string,
  actorUserId: string,
  options: { includeArchived?: boolean; search?: string } = {},
  db: AppDb = getDb(),
): Promise<ApplicationDetailDTO[]> {
  await requirePermission(organizationId, actorUserId, "application:read", db);

  const conditions = [eq(applications.organizationId, organizationId)];

  if (!options.includeArchived) {
    conditions.push(eq(applications.isArchived, false));
  }

  if (options.search?.trim()) {
    conditions.push(ilike(applications.name, `%${options.search.trim()}%`));
  }

  const appRows = await db
    .select()
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.createdAt));

  const result: ApplicationDetailDTO[] = [];

  for (const app of appRows) {
    const envRows = await db
      .select()
      .from(environments)
      .where(
        and(
          eq(environments.applicationId, app.id),
          eq(environments.isArchived, false),
        ),
      )
      .orderBy(environments.orderIndex, environments.name);

    const [bindingsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(resourceBindings)
      .where(eq(resourceBindings.applicationId, app.id));

    result.push({
      ...toApplicationDTO(app),
      environments: envRows.map(toEnvironmentDTO),
      boundResourceCount: bindingsCount?.count ?? 0,
    });
  }

  return result;
}

/**
 * Gets application detail by ID with active environments and bound resource counts.
 */
export async function getApplicationById(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<ApplicationDetailDTO | null> {
  await requirePermission(organizationId, actorUserId, "application:read", db);

  const [appRow] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.organizationId, organizationId),
        eq(applications.id, applicationId),
      ),
    )
    .limit(1);

  if (!appRow) return null;

  const envRows = await db
    .select()
    .from(environments)
    .where(
      and(
        eq(environments.applicationId, appRow.id),
        eq(environments.isArchived, false),
      ),
    )
    .orderBy(environments.orderIndex, environments.name);

  const [bindingsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(resourceBindings)
    .where(eq(resourceBindings.applicationId, appRow.id));

  return {
    ...toApplicationDTO(appRow),
    environments: envRows.map(toEnvironmentDTO),
    boundResourceCount: bindingsCount?.count ?? 0,
  };
}

/**
 * Creates a new application and optionally provisions default environments.
 */
export async function createApplication(
  organizationId: string,
  actorUserId: string,
  input: CreateApplicationInput,
  db: AppDb = getDb(),
): Promise<ApplicationDetailDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "application:create",
    db,
  );

  const slug = await generateUniqueApplicationSlug(
    organizationId,
    input.slug || input.name,
    db,
  );

  const applicationId = crypto.randomUUID();

  const [appRow] = await db
    .insert(applications)
    .values({
      id: applicationId,
      organizationId,
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      isArchived: false,
    })
    .returning();

  const createdEnvironments: EnvironmentDTO[] = [];

  if (input.defaultEnvironments !== false) {
    for (const defEnv of DEFAULT_ENVIRONMENTS) {
      const [envRow] = await db
        .insert(environments)
        .values({
          id: crypto.randomUUID(),
          organizationId,
          applicationId,
          name: defEnv.name,
          slug: defEnv.slug,
          classification: defEnv.classification,
          isProduction: defEnv.isProduction,
          orderIndex: defEnv.orderIndex,
          isArchived: false,
        })
        .returning();

      if (envRow) createdEnvironments.push(toEnvironmentDTO(envRow));
    }
  }

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "application.created",
      targetType: "application",
      targetId: applicationId,
      outcome: "success",
      metadata: {
        name: appRow!.name,
        slug: appRow!.slug,
        environmentsCount: createdEnvironments.length,
      },
    },
    db,
  );

  return {
    ...toApplicationDTO(appRow!),
    environments: createdEnvironments,
    boundResourceCount: 0,
  };
}

/**
 * Updates application properties.
 */
export async function updateApplication(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  input: UpdateApplicationInput,
  db: AppDb = getDb(),
): Promise<ApplicationDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "application:update",
    db,
  );

  const [existing] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.organizationId, organizationId),
        eq(applications.id, applicationId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new Error("Application not found");
  }

  const updateData: Partial<typeof applications.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.description !== undefined)
    updateData.description = input.description?.trim() || null;

  const [updated] = await db
    .update(applications)
    .set(updateData)
    .where(
      and(
        eq(applications.organizationId, organizationId),
        eq(applications.id, applicationId),
      ),
    )
    .returning();

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "application.updated",
      targetType: "application",
      targetId: applicationId,
      outcome: "success",
      metadata: {
        name: updated!.name,
        slug: updated!.slug,
      },
    },
    db,
  );

  return toApplicationDTO(updated!);
}

/**
 * Archives an application (soft delete).
 */
export async function archiveApplication(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<ApplicationDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "application:delete",
    db,
  );

  const [updated] = await db
    .update(applications)
    .set({
      isArchived: true,
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(applications.organizationId, organizationId),
        eq(applications.id, applicationId),
      ),
    )
    .returning();

  if (!updated) throw new Error("Application not found");

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "application.archived",
      targetType: "application",
      targetId: applicationId,
      outcome: "success",
      metadata: { name: updated.name },
    },
    db,
  );

  return toApplicationDTO(updated);
}

/**
 * Unarchives an application.
 */
export async function unarchiveApplication(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<ApplicationDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "application:update",
    db,
  );

  const [updated] = await db
    .update(applications)
    .set({
      isArchived: false,
      archivedAt: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(applications.organizationId, organizationId),
        eq(applications.id, applicationId),
      ),
    )
    .returning();

  if (!updated) throw new Error("Application not found");

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "application.unarchived",
      targetType: "application",
      targetId: applicationId,
      outcome: "success",
      metadata: { name: updated.name },
    },
    db,
  );

  return toApplicationDTO(updated);
}
