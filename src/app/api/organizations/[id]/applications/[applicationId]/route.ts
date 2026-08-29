import { type NextRequest, NextResponse } from "next/server";

import {
  archiveApplication,
  getApplicationById,
  updateApplication,
} from "@/features/applications/server/application-service";
import { updateApplicationSchema } from "@/features/applications/types";
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
    const app = await getApplicationById(
      organizationId,
      applicationId,
      session.user.id,
    );
    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: app });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to get application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, applicationId } = await params;

  try {
    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const updated = await updateApplication(
      organizationId,
      applicationId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, applicationId } = await params;

  try {
    const archived = await archiveApplication(
      organizationId,
      applicationId,
      session.user.id,
    );
    return NextResponse.json({ data: archived });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to archive application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
