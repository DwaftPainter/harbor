import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { transferOwnership } from "@/features/organizations/server/membership-service";
import { transferOwnershipSchema } from "@/features/organizations/types";

export const dynamic = "force-dynamic";

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
    const validated = transferOwnershipSchema.parse(body);
    const result = await transferOwnership(
      id,
      validated.targetUserId,
      session.user.id,
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to transfer ownership";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
