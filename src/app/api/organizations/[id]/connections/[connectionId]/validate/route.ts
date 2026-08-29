import { type NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getCurrentSession } from "@/features/auth/server/session";
import { validateConnection } from "@/features/connections/server/connection-service";

interface RouteParams {
  params: Promise<{ id: string; connectionId: string }>;
}

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, connectionId } = await params;

  try {
    const result = await validateConnection(
      organizationId,
      connectionId,
      session.user.id,
    );
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to validate connection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
