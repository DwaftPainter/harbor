import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getResourceById } from "@/features/resources/server/resource-service";

interface RouteParams {
  params: Promise<{ id: string; resourceId: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, resourceId } = await params;

  try {
    const resource = await getResourceById(
      organizationId,
      resourceId,
      session.user.id,
    );
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      data: {
        outgoing: resource.outgoingRelationships,
        incoming: resource.incomingRelationships,
      },
    });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to get relationships";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
