import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { ACTIVE_ORG_COOKIE } from "@/features/organizations/server/active-organization";
import {
  createOrganization,
  listUserOrganizations,
} from "@/features/organizations/server/organization-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orgs = await listUserOrganizations(session.user.id);
    return NextResponse.json({ data: orgs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list organizations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newOrg = await createOrganization(body, session.user.id);

    const response = NextResponse.json({ data: newOrg }, { status: 201 });
    response.cookies.set(ACTIVE_ORG_COOKIE, newOrg.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create organization";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
