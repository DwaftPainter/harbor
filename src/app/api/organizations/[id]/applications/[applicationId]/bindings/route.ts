import { type NextRequest, NextResponse } from "next/server";

import {
  bindResource,
  listBindings,
} from "@/features/applications/server/binding-service";
import { bindResourceSchema } from "@/features/applications/types";
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
  const environmentId = searchParams.get("environmentId") || undefined;

  try {
    const bindings = await listBindings(
      organizationId,
      applicationId,
      session.user.id,
      environmentId,
    );
    return NextResponse.json({ data: bindings });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error
        ? error.message
        : "Failed to list resource bindings";
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
    const parsed = bindResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid binding payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const binding = await bindResource(
      organizationId,
      applicationId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json({ data: binding }, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to bind resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
