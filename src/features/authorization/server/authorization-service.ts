import { and, eq } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { memberships } from "@/db/schema/organizations";
import {
  hasPermission,
  type Permission,
} from "@/features/authorization/permissions";
import type { OrganizationRole } from "@/features/organizations/types";

export class ForbiddenError extends Error {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";

  constructor(
    message = "You do not have permission to perform this action in this organization.",
  ) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface AuthorizeResult {
  authorized: boolean;
  role: OrganizationRole | null;
  membershipId: string | null;
  error?: string;
}

export async function authorize(
  organizationId: string,
  actorUserId: string,
  permission: Permission,
  db: AppDb = getDb(),
): Promise<AuthorizeResult> {
  if (!organizationId || !actorUserId) {
    return {
      authorized: false,
      role: null,
      membershipId: null,
      error: "Organization ID and Actor User ID are required for authorization",
    };
  }

  const [membership] = await db
    .select({
      id: memberships.id,
      role: memberships.role,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.userId, actorUserId),
      ),
    )
    .limit(1);

  if (!membership) {
    return {
      authorized: false,
      role: null,
      membershipId: null,
      error: "Access denied: user is not a member of this organization",
    };
  }

  const userRole = membership.role as OrganizationRole;
  const isAllowed = hasPermission(userRole, permission);

  if (!isAllowed) {
    return {
      authorized: false,
      role: userRole,
      membershipId: membership.id,
      error: `Access denied: role '${userRole}' does not possess required permission '${permission}'`,
    };
  }

  return {
    authorized: true,
    role: userRole,
    membershipId: membership.id,
  };
}

export async function requirePermission(
  organizationId: string,
  actorUserId: string,
  permission: Permission,
  db: AppDb = getDb(),
): Promise<{ role: OrganizationRole; membershipId: string }> {
  const result = await authorize(organizationId, actorUserId, permission, db);

  if (!result.authorized || !result.role || !result.membershipId) {
    throw new ForbiddenError(
      result.error ||
        `Access denied. Requires '${permission}' in organization '${organizationId}'.`,
    );
  }

  return {
    role: result.role,
    membershipId: result.membershipId,
  };
}
