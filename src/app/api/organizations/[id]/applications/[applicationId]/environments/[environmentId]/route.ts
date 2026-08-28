import { type NextRequest, NextResponse } from "next/server";

import {
  archiveEnvironment,
  updateEnvironment,
} from "@/features/applications/server/environment-service";
import { updateEnvironmentSchema } from "@/features/applications/types";
import { getCurrentSession } from "@/features/auth/server/session";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";

interface RouteParams {
  params: Promise<{
    id: string;
    applicationId: string;
    environmentId: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, environmentId } = await params;

  try {
    const body = await request.json();
    const parsed = updateEnvironmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const updated = await updateEnvironment(
      organizationId,
      environmentId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to update environment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, environmentId } = await params;

  try {
    const archived = await archiveEnvironment(
      organizationId,
      environmentId,
      session.user.id,
    );
    return NextResponse.json({ data: archived });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to archive environment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
