import { type NextRequest, NextResponse } from "next/server";

import {
  createEnvironment,
  listEnvironments,
} from "@/features/applications/server/environment-service";
import { createEnvironmentSchema } from "@/features/applications/types";
import { getCurrentSession } from "@/features/auth/server/session";
import { ForbiddenError } from "@/features/authorization/server/authorization-service";

interface RouteParams {
  params: Promise<{ id: string; applicationId: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, applicationId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const includeArchived = searchParams.get("includeArchived") === "true";

  try {
    const envs = await listEnvironments(
      organizationId,
      applicationId,
      session.user.id,
      { includeArchived },
    );
    return NextResponse.json({ data: envs });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to list environments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId, applicationId } = await params;

  try {
    const body = await request.json();
    const parsed = createEnvironmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid environment payload",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const env = await createEnvironment(
      organizationId,
      applicationId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json({ data: env }, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to create environment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
