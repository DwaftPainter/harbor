import { type NextRequest, NextResponse } from "next/server";

import { ForbiddenError } from "@/features/authorization/server/authorization-service";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  createConnection,
  listConnections,
} from "@/features/connections/server/connection-service";
import { createConnectionSchema } from "@/features/connections/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId } = await params;

  try {
    const connections = await listConnections(organizationId, session.user.id);
    return NextResponse.json({ data: connections });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to list connections";
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
    const parsed = createConnectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }

    const connection = await createConnection(
      organizationId,
      session.user.id,
      parsed.data,
    );
    return NextResponse.json({ data: connection }, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to create connection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
