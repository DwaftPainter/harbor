import { randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { user } from "@/db/schema/auth";
import {
  invitations,
  memberships,
  organizations,
} from "@/db/schema/organizations";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";
import {
  type InviteMemberInput,
  inviteMemberSchema,
} from "@/features/organizations/types";

const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createInvitation(
  organizationId: string,
  input: InviteMemberInput,
  actorUserId: string,
  db: AppDb = getDb(),
) {
  // Enforce invitation:create permission
  await requirePermission(organizationId, actorUserId, "invitation:create", db);

  const validated = inviteMemberSchema.parse(input);
  const normalizedEmail = validated.email.toLowerCase().trim();

  // Check if a user with this email is already a member
  const [existingMember] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .innerJoin(user, eq(memberships.userId, user.id))
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(user.email, normalizedEmail),
      ),
    )
    .limit(1);

  if (existingMember) {
    throw new Error(
      "User with this email is already a member of this organization.",
    );
  }

  // Check for existing pending invitation
  const [existingInvite] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.organizationId, organizationId),
        eq(invitations.email, normalizedEmail),
        eq(invitations.status, "pending"),
      ),
    )
    .limit(1);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_MS);

  if (existingInvite) {
    // Refresh token and role
    const [updated] = await db
      .update(invitations)
      .set({
        token,
        role: validated.role,
        inviterId: actorUserId,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, existingInvite.id))
      .returning();

    // Emit audit event (without raw token!)
    await recordAuditEvent(
      {
        organizationId,
        actorId: actorUserId,
        actorType: "user",
        action: "invitation.created",
        targetType: "invitation",
        targetId: existingInvite.id,
        outcome: "success",
        metadata: {
          email: normalizedEmail,
          role: validated.role,
          refreshed: true,
        },
      },
      db,
    );

    return {
      invitation: updated,
      token,
    };
  }

  const invitationId = randomUUID();
  const [newInvite] = await db
    .insert(invitations)
    .values({
      id: invitationId,
      organizationId,
      email: normalizedEmail,
      role: validated.role,
      inviterId: actorUserId,
      token,
      status: "pending",
      expiresAt,
    })
    .returning();

  // Emit audit event (without raw token!)
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "invitation.created",
      targetType: "invitation",
      targetId: invitationId,
      outcome: "success",
      metadata: {
        email: normalizedEmail,
        role: validated.role,
      },
    },
    db,
  );

  return {
    invitation: newInvite,
    token,
  };
}

export async function listInvitations(
  organizationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
) {
  // Enforce invitation:read permission
  await requirePermission(organizationId, actorUserId, "invitation:read", db);

  const rows = await db
    .select({
      id: invitations.id,
      organizationId: invitations.organizationId,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
      inviter: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(invitations)
    .innerJoin(user, eq(invitations.inviterId, user.id))
    .where(
      and(
        eq(invitations.organizationId, organizationId),
        eq(invitations.status, "pending"),
        gt(invitations.expiresAt, new Date()),
      ),
    );

  return rows;
}

export async function revokeInvitation(
  organizationId: string,
  invitationId: string,
  actorUserId: string,
  db: AppDb = getDb(),
) {
  // Enforce invitation:revoke permission
  await requirePermission(organizationId, actorUserId, "invitation:revoke", db);

  const [revoked] = await db
    .update(invitations)
    .set({
      status: "revoked",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(invitations.id, invitationId),
        eq(invitations.organizationId, organizationId),
      ),
    )
    .returning();

  if (!revoked) {
    throw new Error("Invitation not found.");
  }

  // Emit audit event
  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "invitation.revoked",
      targetType: "invitation",
      targetId: invitationId,
      outcome: "success",
      metadata: {
        email: revoked.email,
        role: revoked.role,
      },
    },
    db,
  );

  return { success: true };
}

export async function getInvitationByToken(token: string, db: AppDb = getDb()) {
  const [row] = await db
    .select({
      id: invitations.id,
      organizationId: invitations.organizationId,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        logo: organizations.logo,
      },
      inviter: {
        name: user.name,
        email: user.email,
      },
    })
    .from(invitations)
    .innerJoin(organizations, eq(invitations.organizationId, organizations.id))
    .innerJoin(user, eq(invitations.inviterId, user.id))
    .where(eq(invitations.token, token))
    .limit(1);

  if (!row) {
    return {
      valid: false,
      reason: "not_found",
    } as const;
  }

  const isExpired = row.expiresAt < new Date();
  const isPending = row.status === "pending";

  if (!isPending || isExpired) {
    return {
      valid: false,
      reason: isExpired ? "expired" : "consumed",
      organization: row.organization,
    } as const;
  }

  return {
    valid: true,
    invitation: {
      id: row.id,
      email: row.email,
      role: row.role,
      expiresAt: row.expiresAt,
    },
    organization: row.organization,
    inviter: row.inviter,
  } as const;
}

export async function acceptInvitation(
  token: string,
  userId: string,
  db: AppDb = getDb(),
) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  if (!invitation) {
    throw new Error("Invitation not found or invalid.");
  }

  if (invitation.status !== "pending") {
    throw new Error("This invitation has already been accepted or revoked.");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("This invitation has expired.");
  }

  // Check if user is already a member
  const [existingMembership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, invitation.organizationId),
        eq(memberships.userId, userId),
      ),
    )
    .limit(1);

  if (existingMembership) {
    // Mark as accepted and return organizationId
    await db
      .update(invitations)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(invitations.id, invitation.id));

    return {
      organizationId: invitation.organizationId,
      alreadyMember: true,
    };
  }

  // Add membership
  const membershipId = randomUUID();
  await db.insert(memberships).values({
    id: membershipId,
    organizationId: invitation.organizationId,
    userId,
    role: invitation.role,
  });

  // Mark invitation accepted
  await db
    .update(invitations)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(invitations.id, invitation.id));

  // Emit audit event
  await recordAuditEvent(
    {
      organizationId: invitation.organizationId,
      actorId: userId,
      actorType: "user",
      action: "invitation.accepted",
      targetType: "membership",
      targetId: membershipId,
      outcome: "success",
      metadata: {
        invitationId: invitation.id,
        role: invitation.role,
      },
    },
    db,
  );

  return {
    organizationId: invitation.organizationId,
    alreadyMember: false,
  };
}
