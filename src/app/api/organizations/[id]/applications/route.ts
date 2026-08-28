import { type NextRequest, NextResponse } from "next/server";

import {
  createApplication,
  listApplications,
} from "@/features/applications/server/application-service";
import { createApplicationSchema } from "@/features/applications/types";
import { getCurrentSession } from "@/features/auth/server/session";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";

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
  const includeArchived = searchParams.get("includeArchived") === "true";
  const search = searchParams.get("search") || undefined;

  try {
    const apps = await listApplications(organizationId, session.user.id, {
      includeArchived,
      search,
    });
    return NextResponse.json({ data: apps });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to list applications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId } = await params;

  try {
    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid application payload",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const app = await createApplication(
      organizationId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json({ data: app }, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to create application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
