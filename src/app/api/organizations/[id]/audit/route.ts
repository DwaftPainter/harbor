import { type NextRequest, NextResponse } from "next/server";

import { listAuditEvents } from "@/features/audit/server/audit-service";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getCurrentSession } from "@/features/auth/server/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized: authentication required." },
      { status: 401 },
    );
  }

  const { id: organizationId } = await params;
  const searchParams = request.nextUrl.searchParams;

  const filters = {
    action: searchParams.get("action") || undefined,
    actorId: searchParams.get("actorId") || undefined,
    targetType: searchParams.get("targetType") || undefined,
    outcome:
      (searchParams.get("outcome") as "success" | "denied" | "error") ||
      undefined,
    fromDate: searchParams.get("fromDate") || undefined,
    toDate: searchParams.get("toDate") || undefined,
    limit: searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 25,
    offset: searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0,
  };

  try {
    const data = await listAuditEvents(
      organizationId,
      session.user.id,
      filters,
    );

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Failed to list audit events:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve audit log.",
      },
      { status: 500 },
    );
  }
}
