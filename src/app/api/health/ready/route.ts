import { sql } from "drizzle-orm";

import { getDb } from "@/db";
import { getServerEnv } from "@/env";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);

    return Response.json(
      {
        service: "harbor",
        status: "ready",
        version: getServerEnv().APP_VERSION,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    logger.error("health.readiness_failed");

    return Response.json(
      {
        service: "harbor",
        status: "unavailable",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
