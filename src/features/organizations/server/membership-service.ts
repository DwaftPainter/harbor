import { and, count, eq } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { user } from "@/db/schema/auth";
import { memberships } from "@/db/schema/organizations";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";
import {
  type OrganizationMemberWithUser,
  type UpdateMemberRoleInput,
  updateMemberRoleSchema,
} from "@/features/organizations/types";

export async function listMembers(
  organizationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<OrganizationMemberWithUser[]> {
  // Enforce member:read permission
  await requirePermission(organizationId, actorUserId, "member:read", db);

  const rows = await db
    .select({
      id: memberships.id,
      organizationId: memberships.organizationId,
      userId: memberships.userId,
      role: memberships.role,
      createdAt: memberships.createdAt,
      updatedAt: memberships.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(memberships)
    .innerJoin(user, eq(memberships.userId, user.id))
    .where(eq(memberships.organizationId, organizationId));

  return rows as OrganizationMemberWithUser[];
}

export async function updateMemberRole(
  organizationId: string,
  targetMemberId: string,
  input: UpdateMemberRoleInput,
  actorUserId: string,
  db: AppDb = getDb(),
) {
  // Enforce member:update permission
  const { role: actorRole } = await requirePermission(
    organizationId,
    actorUserId,
    "member:update",
    db,
  );

  const validated = updateMemberRoleSchema.parse(input);

  // Get target membership
  const [targetMembership] = await db
    .select({
      id: memberships.id,
      role: memberships.role,
      userId: memberships.userId,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.id, targetMemberId),
        eq(memberships.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!targetMembership) {
    throw new Error("Member not found in this organization.");
  }

  // Hierarchy rules
  if (actorRole !== "owner") {
    if (actorRole === "admin") {
      // Admins can only assign member or viewer, and cannot modify owners or admins
      if (
        targetMembership.role === "owner" ||
        targetMembership.role === "admin" ||
        validated.role === "owner" ||
        validated.role === "admin"
      ) {
        throw new Error(
          "Forbidden: admins can only manage member and viewer roles.",
        );
      }
    } else {
      throw new Error(
        "Forbidden: you do not have permission to change member roles.",
      );
    }
  }

  // Check last owner invariant
  if (targetMembership.role === "owner" && validated.role !== "owner") {
    const [ownerCountRes] = await db
      .select({ total: count() })
      .from(memberships)
      .where(
        and(
          eq(memberships.organizationId, organizationId),
          eq(memberships.role, "owner"),
        ),
      );

    if ((ownerCountRes?.total ?? 0) <= 1) {
      throw new Error("Cannot demote the last owner of the organization.");
    }
  }

  const [updated] = await db
    .update(memberships)
    .set({
      role: validated.role,
      updatedAt: new Date(),
    })
    .where(eq(memberships.id, targetMemberId))
    .returning();

  // Emit audit event
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "member.role_updated",
      targetType: "membership",
      targetId: targetMemberId,
      outcome: "success",
      metadata: {
        targetUserId: targetMembership.userId,
        previousRole: targetMembership.role,
        newRole: validated.role,
      },
    },
    db,
  );

  return updated;
}

export async function removeMember(
  organizationId: string,
  targetMemberId: string,
  actorUserId: string,
  db: AppDb = getDb(),
) {
  // Get target membership first
  const [targetMembership] = await db
    .select({
      id: memberships.id,
      role: memberships.role,
      userId: memberships.userId,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.id, targetMemberId),
        eq(memberships.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!targetMembership) {
    throw new Error("Member not found in this organization.");
  }

  const isSelf = targetMembership.userId === actorUserId;

  // If not removing self, require member:remove permission
  let actorRole = "member";
  if (!isSelf) {
    const permResult = await requirePermission(
      organizationId,
      actorUserId,
      "member:remove",
      db,
    );
    actorRole = permResult.role;
  }

  // Check last owner invariant
  if (targetMembership.role === "owner") {
    const [ownerCountRes] = await db
      .select({ total: count() })
      .from(memberships)
      .where(
        and(
          eq(memberships.organizationId, organizationId),
          eq(memberships.role, "owner"),
        ),
      );

    if ((ownerCountRes?.total ?? 0) <= 1) {
      throw new Error(
        "The last owner cannot leave the organization without transferring ownership or deleting it.",
      );
    }
  }

  if (!isSelf) {
    if (actorRole === "owner") {
      // Owner can remove anyone except last owner (checked above)
    } else if (actorRole === "admin") {
      // Admin can only remove member or viewer
      if (
        targetMembership.role === "owner" ||
        targetMembership.role === "admin"
      ) {
        throw new Error("Forbidden: admins cannot remove owners or admins.");
      }
    } else {
      throw new Error("Forbidden: you cannot remove other members.");
    }
  }

  await db.delete(memberships).where(eq(memberships.id, targetMemberId));

  // Emit audit event
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "member.removed",
      targetType: "membership",
      targetId: targetMemberId,
      outcome: "success",
      metadata: {
        removedUserId: targetMembership.userId,
        removedRole: targetMembership.role,
        isSelfLeave: isSelf,
      },
    },
    db,
  );

  return { success: true };
}

export async function transferOwnership(
  organizationId: string,
  targetUserId: string,
  currentOwnerUserId: string,
  db: AppDb = getDb(),
) {
  // Enforce ownership:transfer permission (Owner only)
  await requirePermission(
    organizationId,
    currentOwnerUserId,
    "ownership:transfer",
    db,
  );

  // Verify target is an existing member
  const [targetMembership] = await db
    .select({ id: memberships.id, role: memberships.role })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.userId, targetUserId),
      ),
    )
    .limit(1);

  if (!targetMembership) {
    throw new Error("Target user is not a member of this organization.");
  }

  // Promote target user to owner
  const [updatedTarget] = await db
    .update(memberships)
    .set({
      role: "owner",
      updatedAt: new Date(),
    })
    .where(eq(memberships.id, targetMembership.id))
    .returning();

  // Emit audit event
  await recordAuditEvent(
    {
      organizationId,
      actorId: currentOwnerUserId,
      actorType: "user",
      action: "ownership.transferred",
      targetType: "membership",
      targetId: targetMembership.id,
      outcome: "success",
      metadata: {
        newOwnerUserId: targetUserId,
        previousRole: targetMembership.role,
      },
    },
    db,
  );

  return updatedTarget;
}
