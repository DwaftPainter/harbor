import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { ACTIVE_ORG_COOKIE } from "@/features/organizations/server/active-organization";
import {
  acceptInvitation,
  getInvitationByToken,
} from "@/features/organizations/server/invitation-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  try {
    const result = await getInvitationByToken(token);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      {
        error: "Please sign in or create an account to accept this invitation.",
      },
      { status: 401 },
    );
  }

  const { token } = await params;

  try {
    const result = await acceptInvitation(token, session.user.id);

    const response = NextResponse.json({ data: result });
    response.cookies.set(ACTIVE_ORG_COOKIE, result.organizationId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept invitation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
