import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/features/auth/server/session";
import { ACTIVE_ORG_COOKIE } from "@/features/organizations/server/active-organization";
import { getOrganizationById } from "@/features/organizations/server/organization-service";

export const dynamic = "force-dynamic";

const setActiveOrgSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { organizationId } = setActiveOrgSchema.parse(body);

    // Verify user is a member of this organization
    const org = await getOrganizationById(organizationId, session.user.id);
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found or you are not a member" },
        { status: 404 },
      );
    }

    const response = NextResponse.json({
      data: org.organization,
      role: org.role,
    });

    response.cookies.set(ACTIVE_ORG_COOKIE, organizationId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to set active organization";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
