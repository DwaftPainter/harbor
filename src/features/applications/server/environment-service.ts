import { and, eq } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { environments } from "@/db/schema/applications";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";
import { slugify } from "@/features/organizations/slug";

import type {
  CreateEnvironmentInput,
  EnvironmentClassification,
  EnvironmentDTO,
  UpdateEnvironmentInput,
} from "../types";

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

export async function generateUniqueEnvironmentSlug(
  applicationId: string,
  baseText: string,
  db: AppDb = getDb(),
): Promise<string> {
  const baseSlug = slugify(baseText);
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const [existing] = await db
      .select({ id: environments.id })
      .from(environments)
      .where(
        and(
          eq(environments.applicationId, applicationId),
          eq(environments.slug, candidateSlug),
        ),
      )
      .limit(1);

    if (!existing) return candidateSlug;

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Lists environments for an application.
 */
export async function listEnvironments(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  options: { includeArchived?: boolean } = {},
  db: AppDb = getDb(),
): Promise<EnvironmentDTO[]> {
  await requirePermission(organizationId, actorUserId, "environment:read", db);

  const conditions = [
    eq(environments.organizationId, organizationId),
    eq(environments.applicationId, applicationId),
  ];

  if (!options.includeArchived) {
    conditions.push(eq(environments.isArchived, false));
  }

  const rows = await db
    .select()
    .from(environments)
    .where(and(...conditions))
    .orderBy(environments.orderIndex, environments.name);

  return rows.map(toEnvironmentDTO);
}

/**
 * Creates a new environment in an application.
 */
export async function createEnvironment(
  organizationId: string,
  applicationId: string,
  actorUserId: string,
  input: CreateEnvironmentInput,
  db: AppDb = getDb(),
): Promise<EnvironmentDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "environment:create",
    db,
  );

  const slug = await generateUniqueEnvironmentSlug(
    applicationId,
    input.slug || input.name,
    db,
  );

  const environmentId = crypto.randomUUID();

  // If new environment is production, ensure single production designation
  if (input.isProduction) {
    await db
      .update(environments)
      .set({ isProduction: false, updatedAt: new Date() })
      .where(
        and(
          eq(environments.organizationId, organizationId),
          eq(environments.applicationId, applicationId),
        ),
      );
  }

  const [row] = await db
    .insert(environments)
    .values({
      id: environmentId,
      organizationId,
      applicationId,
      name: input.name.trim(),
      slug,
      classification: input.classification,
      isProduction: input.isProduction || false,
      orderIndex: input.orderIndex ?? 0,
      isArchived: false,
    })
    .returning();

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "environment.created",
      targetType: "environment",
      targetId: environmentId,
      outcome: "success",
      metadata: {
        name: row!.name,
        slug: row!.slug,
        applicationId,
      },
    },
    db,
  );

  return toEnvironmentDTO(row!);
}

/**
 * Updates environment properties.
 */
export async function updateEnvironment(
  organizationId: string,
  environmentId: string,
  actorUserId: string,
  input: UpdateEnvironmentInput,
  db: AppDb = getDb(),
): Promise<EnvironmentDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "environment:update",
    db,
  );

  const [existing] = await db
    .select()
    .from(environments)
    .where(
      and(
        eq(environments.organizationId, organizationId),
        eq(environments.id, environmentId),
      ),
    )
    .limit(1);

  if (!existing) throw new Error("Environment not found");

  if (input.isProduction) {
    await db
      .update(environments)
      .set({ isProduction: false, updatedAt: new Date() })
      .where(
        and(
          eq(environments.organizationId, organizationId),
          eq(environments.applicationId, existing.applicationId),
        ),
      );
  }

  const updateData: Partial<typeof environments.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.classification !== undefined)
    updateData.classification = input.classification;
  if (input.isProduction !== undefined)
    updateData.isProduction = input.isProduction;
  if (input.orderIndex !== undefined) updateData.orderIndex = input.orderIndex;

  const [updated] = await db
    .update(environments)
    .set(updateData)
    .where(
      and(
        eq(environments.organizationId, organizationId),
        eq(environments.id, environmentId),
      ),
    )
    .returning();

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "environment.updated",
      targetType: "environment",
      targetId: environmentId,
      outcome: "success",
      metadata: {
        name: updated!.name,
        slug: updated!.slug,
      },
    },
    db,
  );

  return toEnvironmentDTO(updated!);
}

/**
 * Archives an environment.
 */
export async function archiveEnvironment(
  organizationId: string,
  environmentId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<EnvironmentDTO> {
  await requirePermission(
    organizationId,
    actorUserId,
    "environment:delete",
    db,
  );

  const [updated] = await db
    .update(environments)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(environments.organizationId, organizationId),
        eq(environments.id, environmentId),
      ),
    )
    .returning();

  if (!updated) throw new Error("Environment not found");

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "environment.archived",
      targetType: "environment",
      targetId: environmentId,
      outcome: "success",
      metadata: { name: updated.name },
    },
    db,
  );

  return toEnvironmentDTO(updated);
}
