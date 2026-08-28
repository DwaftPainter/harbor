import { type NextRequest, NextResponse } from "next/server";

import { unbindResource } from "@/features/applications/server/binding-service";
import { getCurrentSession } from "@/features/auth/server/session";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";

interface RouteParams {
  params: Promise<{
    id: string;
    applicationId: string;
    bindingId: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, bindingId } = await params;

  try {
    await unbindResource(organizationId, bindingId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to unbind resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
