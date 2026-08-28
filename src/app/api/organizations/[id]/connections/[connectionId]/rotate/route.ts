import { type NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getCurrentSession } from "@/features/auth/server/session";
import { rotateConnectionCredentials } from "@/features/connections/server/connection-service";
import { rotateConnectionSchema } from "@/features/connections/types";

interface RouteParams {
  params: Promise<{ id: string; connectionId: string }>;
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, connectionId } = await params;

  try {
    const body = await request.json();
    const parsed = rotateConnectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    const updated = await rotateConnectionCredentials(
      organizationId,
      connectionId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to rotate credentials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
