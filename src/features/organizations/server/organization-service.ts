import { randomUUID } from "node:crypto";
import { and, count, eq } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { memberships, organizations } from "@/db/schema/organizations";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";
import {
  type CreateOrganizationInput,
  createOrganizationSchema,
  type OrganizationRole,
  RESERVED_SLUGS,
  type UpdateOrganizationInput,
  updateOrganizationSchema,
  type UserOrganization,
} from "@/features/organizations/types";

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return base || "org";
}

export async function createOrganization(
  input: CreateOrganizationInput,
  userId: string,
  db: AppDb = getDb(),
): Promise<UserOrganization> {
  const validated = createOrganizationSchema.parse(input);

  let targetSlug = validated.slug;
  if (!targetSlug) {
    const baseSlug = slugify(validated.name);
    targetSlug = baseSlug;

    // Check if reserved or exists
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, targetSlug))
      .limit(1);

    if (
      existing ||
      RESERVED_SLUGS.includes(targetSlug as (typeof RESERVED_SLUGS)[number])
    ) {
      targetSlug = `${baseSlug}-${randomUUID().slice(0, 6)}`;
    }
  } else {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, targetSlug))
      .limit(1);

    if (existing) {
      throw new Error(`The slug "${targetSlug}" is already taken.`);
    }
  }

  const organizationId = randomUUID();
  const membershipId = randomUUID();

  const [org] = await db
    .insert(organizations)
    .values({
      id: organizationId,
      name: validated.name,
      slug: targetSlug,
    })
    .returning();

  if (!org) {
    throw new Error("Failed to create organization.");
  }

  await db.insert(memberships).values({
    id: membershipId,
    organizationId: org.id,
    userId,
    role: "owner",
  });

  // Emit audit event
  await recordAuditEvent(
    {
      organizationId: org.id,
      actorId: userId,
      actorType: "user",
      action: "organization.created",
      targetType: "organization",
      targetId: org.id,
      outcome: "success",
      metadata: {
        name: org.name,
        slug: org.slug,
      },
    },
    db,
  );

  return {
    ...org,
    role: "owner",
    memberCount: 1,
  };
}

export async function listUserOrganizations(
  userId: string,
  db: AppDb = getDb(),
): Promise<UserOrganization[]> {
  const userMemberships = await db
    .select({
      membership: memberships,
      organization: organizations,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId));

  const results: UserOrganization[] = [];

  for (const row of userMemberships) {
    const [memberCountRes] = await db
      .select({ total: count() })
      .from(memberships)
      .where(eq(memberships.organizationId, row.organization.id));

    results.push({
      ...row.organization,
      role: row.membership.role as OrganizationRole,
      memberCount: memberCountRes?.total ?? 1,
    });
  }

  return results;
}

export async function getOrganizationById(
  organizationId: string,
  userId: string,
  db: AppDb = getDb(),
): Promise<{ organization: UserOrganization; role: OrganizationRole } | null> {
  const [row] = await db
    .select({
      membership: memberships,
      organization: organizations,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.userId, userId),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const [memberCountRes] = await db
    .select({ total: count() })
    .from(memberships)
    .where(eq(memberships.organizationId, organizationId));

  const role = row.membership.role as OrganizationRole;

  return {
    organization: {
      ...row.organization,
      role,
      memberCount: memberCountRes?.total ?? 1,
    },
    role,
  };
}

export async function updateOrganization(
  organizationId: string,
  input: UpdateOrganizationInput,
  actorUserId: string,
  db: AppDb = getDb(),
) {
  // Enforce organization:update permission
  await requirePermission(
    organizationId,
    actorUserId,
    "organization:update",
    db,
  );

  const validated = updateOrganizationSchema.parse(input);

  const callerContext = await getOrganizationById(
    organizationId,
    actorUserId,
    db,
  );
  if (!callerContext) {
    throw new Error("Organization not found or access denied.");
  }

  if (validated.slug) {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        and(
          eq(organizations.slug, validated.slug),
          eq(organizations.id, organizationId),
        ),
      )
      .limit(1);

    if (!existing) {
      const [conflict] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, validated.slug))
        .limit(1);

      if (conflict) {
        throw new Error(`The slug "${validated.slug}" is already in use.`);
      }
    }
  }

  const [updated] = await db
    .update(organizations)
    .set({
      ...(validated.name ? { name: validated.name } : {}),
      ...(validated.slug ? { slug: validated.slug } : {}),
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId))
    .returning();

  // Emit audit event
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "organization.updated",
      targetType: "organization",
      targetId: organizationId,
      outcome: "success",
      metadata: {
        changes: validated,
      },
    },
    db,
  );

  return updated;
}

export async function deleteOrganization(
  organizationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
) {
  // Enforce organization:delete permission (Owner only)
  await requirePermission(
    organizationId,
    actorUserId,
    "organization:delete",
    db,
  );

  const callerContext = await getOrganizationById(
    organizationId,
    actorUserId,
    db,
  );
  if (!callerContext) {
    throw new Error("Organization not found or access denied.");
  }

  // Emit audit event prior to deletion cascade
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "organization.deleted",
      targetType: "organization",
      targetId: organizationId,
      outcome: "success",
      metadata: {
        name: callerContext.organization.name,
        slug: callerContext.organization.slug,
      },
    },
    db,
  );

  await db.delete(organizations).where(eq(organizations.id, organizationId));
  return { success: true };
}
