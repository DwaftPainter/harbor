import type { OrganizationRole } from "@/features/organizations/types";

export const PERMISSIONS = [
  // Organization lifecycle
  "organization:read",
  "organization:update",
  "organization:delete",
  "ownership:transfer",

  // Members & Invitations
  "member:read",
  "member:invite",
  "member:update",
  "member:remove",
  "invitation:read",
  "invitation:create",
  "invitation:revoke",

  // Audit Logs
  "audit:read",

  // Provider Connections
  "connection:read",
  "connection:create",
  "connection:update",
  "connection:delete",
  "connection:sync",

  // Resource Inventory
  "resource:read",

  // Applications & Environments
  "application:read",
  "application:create",
  "application:update",
  "application:delete",
  "environment:read",
  "environment:create",
  "environment:update",
  "environment:delete",

  // Deployments & Config
  "deployment:read",
  "config:read",
  "config:update",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<OrganizationRole, readonly Permission[]> =
  {
    owner: [
      "organization:read",
      "organization:update",
      "organization:delete",
      "ownership:transfer",
      "member:read",
      "member:invite",
      "member:update",
      "member:remove",
      "invitation:read",
      "invitation:create",
      "invitation:revoke",
      "audit:read",
      "connection:read",
      "connection:create",
      "connection:update",
      "connection:delete",
      "connection:sync",
      "resource:read",
      "application:read",
      "application:create",
      "application:update",
      "application:delete",
      "environment:read",
      "environment:create",
      "environment:update",
      "environment:delete",
      "deployment:read",
      "config:read",
      "config:update",
    ],
    admin: [
      "organization:read",
      "organization:update",
      // Not organization:delete (owner only)
      // Not ownership:transfer (owner only)
      "member:read",
      "member:invite",
      "member:update",
      "member:remove",
      "invitation:read",
      "invitation:create",
      "invitation:revoke",
      "audit:read",
      "connection:read",
      "connection:create",
      "connection:update",
      "connection:delete",
      "connection:sync",
      "resource:read",
      "application:read",
      "application:create",
      "application:update",
      "application:delete",
      "environment:read",
      "environment:create",
      "environment:update",
      "environment:delete",
      "deployment:read",
      "config:read",
      "config:update",
    ],
    member: [
      "organization:read",
      "member:read",
      "invitation:read",
      // Not member:invite, update, remove
      // Not audit:read
      "connection:read",
      // Not connection:create, update, delete, sync
      "resource:read",
      "application:read",
      "application:create",
      "application:update",
      "application:delete",
      "environment:read",
      "environment:create",
      "environment:update",
      "environment:delete",
      "deployment:read",
      "config:read",
      "config:update",
    ],
    viewer: [
      "organization:read",
      "member:read",
      "invitation:read",
      "connection:read",
      "resource:read",
      "application:read",
      "environment:read",
      "deployment:read",
      "config:read",
    ],
  };

const VALID_ROLES = new Set<string>(["owner", "admin", "member", "viewer"]);
const VALID_PERMISSIONS = new Set<string>(PERMISSIONS);

export function isOrganizationRole(role: unknown): role is OrganizationRole {
  return typeof role === "string" && VALID_ROLES.has(role);
}

export function isPermission(permission: unknown): permission is Permission {
  return typeof permission === "string" && VALID_PERMISSIONS.has(permission);
}

/**
 * Pure authorization evaluation function.
 * Deny-by-default: returns false for null, undefined, unknown roles, or missing permissions.
 */
export function hasPermission(
  role: string | null | undefined,
  permission: Permission,
): boolean {
  if (!isOrganizationRole(role) || !isPermission(permission)) {
    return false;
  }

  const roleGrants = ROLE_PERMISSIONS[role];
  return roleGrants ? roleGrants.includes(permission) : false;
}

export function getRolePermissions(
  role: OrganizationRole,
): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
