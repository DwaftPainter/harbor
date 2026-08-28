import { type NextRequest, NextResponse } from "next/server";

import { getBindingSuggestions } from "@/features/applications/server/binding-service";
import { getCurrentSession } from "@/features/auth/server/session";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";

interface RouteParams {
  params: Promise<{ id: string; applicationId: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, applicationId } = await params;

  try {
    const suggestions = await getBindingSuggestions(
      organizationId,
      applicationId,
      session.user.id,
    );
    return NextResponse.json({ data: suggestions });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to get suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
