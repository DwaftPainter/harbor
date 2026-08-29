import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { listMembers } from "@/features/organizations/server/membership-service";

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
    const members = await listMembers(id, session.user.id);
    return NextResponse.json({ data: members });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list members";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
