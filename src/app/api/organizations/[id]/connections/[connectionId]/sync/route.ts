import { type NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  executeSyncRun,
  listSyncRuns,
  queueSyncRun,
} from "@/features/sync/server/sync-engine";
import { queueSyncSchema } from "@/features/sync/types";

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
    const runs = await listSyncRuns(
      organizationId,
      connectionId,
      session.user.id,
    );
    return NextResponse.json({ data: runs });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to list sync runs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, connectionId } = await params;

  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const parsed = queueSyncSchema.safeParse(body);
    const options = parsed.success ? parsed.data : undefined;

    // 1. Queue run
    const queuedRun = await queueSyncRun(
      organizationId,
      connectionId,
      session.user.id,
      options,
    );

    // 2. Execute immediately
    const result = await executeSyncRun(queuedRun.id);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to trigger sync";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
