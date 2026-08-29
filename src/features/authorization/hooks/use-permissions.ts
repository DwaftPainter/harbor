"use client";

import { useMemo } from "react";

import {
  hasPermission,
  type Permission,
} from "@/features/authorization/permissions";
import type { OrganizationRole } from "@/features/organizations/types";

export function useCan(
  role: OrganizationRole | string | null | undefined,
  permission: Permission,
): boolean {
  return useMemo(() => hasPermission(role, permission), [role, permission]);
}

export function usePermissions(
  role: OrganizationRole | string | null | undefined,
) {
  return useMemo(() => {
    return {
      canReadOrg: hasPermission(role, "organization:read"),
      canUpdateOrg: hasPermission(role, "organization:update"),
      canDeleteOrg: hasPermission(role, "organization:delete"),
      canTransferOwnership: hasPermission(role, "ownership:transfer"),

      canReadMembers: hasPermission(role, "member:read"),
      canInviteMembers: hasPermission(role, "member:invite"),
      canUpdateMembers: hasPermission(role, "member:update"),
      canRemoveMembers: hasPermission(role, "member:remove"),

      canReadInvitations: hasPermission(role, "invitation:read"),
      canCreateInvitations: hasPermission(role, "invitation:create"),
      canRevokeInvitations: hasPermission(role, "invitation:revoke"),

      canReadAudit: hasPermission(role, "audit:read"),

      canReadConnections: hasPermission(role, "connection:read"),
      canCreateConnections: hasPermission(role, "connection:create"),
      canUpdateConnections: hasPermission(role, "connection:update"),
      canDeleteConnections: hasPermission(role, "connection:delete"),
      canSyncConnections: hasPermission(role, "connection:sync"),

      canReadApplications: hasPermission(role, "application:read"),
      canCreateApplications: hasPermission(role, "application:create"),
      canUpdateApplications: hasPermission(role, "application:update"),
      canDeleteApplications: hasPermission(role, "application:delete"),

      isOwner: role === "owner",
      isAdmin: role === "admin",
      isMember: role === "member",
      isViewer: role === "viewer",
    };
  }, [role]);
}
