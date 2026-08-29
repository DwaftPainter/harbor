import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import {
  createInvitation,
  listInvitations,
} from "@/features/organizations/server/invitation-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const invitations = await listInvitations(id, session.user.id);
    return NextResponse.json({ data: invitations });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list invitations";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const result = await createInvitation(id, body, session.user.id);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create invitation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
