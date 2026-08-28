import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { listUserOrganizations } from "@/features/organizations/server/organization-service";
import type { UserOrganization } from "@/features/organizations/types";

export const ACTIVE_ORG_COOKIE = "harbor_active_org";

export async function getActiveOrganization(userId: string): Promise<{
  activeOrg: UserOrganization | null;
  userOrgs: UserOrganization[];
}> {
  await connection();

  const userOrgs = await listUserOrganizations(userId);
  if (userOrgs.length === 0) {
    return { activeOrg: null, userOrgs: [] };
  }

  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  if (activeOrgId) {
    const matched = userOrgs.find((org) => org.id === activeOrgId);
    if (matched) {
      return { activeOrg: matched, userOrgs };
    }
  }

  // Fallback to first organization
  return { activeOrg: userOrgs[0] ?? null, userOrgs };
}

export async function requireActiveOrganization() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/sign-in");
  }

  const { activeOrg, userOrgs } = await getActiveOrganization(session.user.id);

  return {
    session,
    activeOrg,
    userOrgs,
  };
}
