import { toNextJsHandler } from "better-auth/next-js";

import { recordAuthOutcome } from "@/features/auth/server/auth-telemetry";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

async function handleAuthRequest(request: Request) {
  const startedAt = performance.now();
  const pathname = new URL(request.url).pathname.replace(/^\/api\/auth/, "");

  try {
    const response = await getAuth().handler(request);

    recordAuthOutcome({
      durationMs: performance.now() - startedAt,
      method: request.method,
      pathname,
      status: response.status,
    });

    return response;
  } catch (error) {
    recordAuthOutcome({
      durationMs: performance.now() - startedAt,
      method: request.method,
      pathname,
      status: 500,
    });
    throw error;
  }
}

export const { GET, POST, PATCH, PUT, DELETE } =
  toNextJsHandler(handleAuthRequest);
