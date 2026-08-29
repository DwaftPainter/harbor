import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { revokeInvitation } from "@/features/organizations/server/invitation-service";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> },
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, invitationId } = await params;

  try {
    const result = await revokeInvitation(id, invitationId, session.user.id);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to revoke invitation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
