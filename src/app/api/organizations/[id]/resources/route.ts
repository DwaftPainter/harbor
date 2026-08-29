import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/features/auth/server/session";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { listResources } from "@/features/resources/server/resource-service";
import { resourceFilterSchema } from "@/features/resources/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId } = await params;
  const searchParams = request.nextUrl.searchParams;

  const rawFilters = {
    providerId: searchParams.get("providerId") || undefined,
    connectionId: searchParams.get("connectionId") || undefined,
    kind: searchParams.get("kind") || undefined,
    status: searchParams.get("status") || undefined,
    isStale: searchParams.get("isStale") || undefined,
    search: searchParams.get("search") || undefined,
    cursor: searchParams.get("cursor") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
  };

  const parsed = resourceFilterSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query filters", details: parsed.error.format() },
      { status: 400 },
    );
  }

  try {
    const result = await listResources(
      organizationId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to list resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
