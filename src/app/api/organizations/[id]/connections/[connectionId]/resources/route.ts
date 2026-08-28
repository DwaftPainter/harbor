import { type NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getCurrentSession } from "@/features/auth/server/session";
import { listDiscoveredResources } from "@/features/sync/server/sync-engine";

interface RouteParams {
  params: Promise<{ id: string; connectionId: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, connectionId } = await params;

  try {
    const resources = await listDiscoveredResources(
      organizationId,
      connectionId,
      session.user.id,
    );
    return NextResponse.json({ data: resources });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error
        ? error.message
        : "Failed to list discovered resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
