import { type NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getCurrentSession } from "@/features/auth/server/session";
import { cancelSyncRun } from "@/features/sync/server/sync-engine";

interface RouteParams {
  params: Promise<{ id: string; connectionId: string; runId: string }>;
}

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, runId } = await params;

  try {
    const cancelled = await cancelSyncRun(
      organizationId,
      runId,
      session.user.id,
    );
    return NextResponse.json({ data: cancelled });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to cancel sync run";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
