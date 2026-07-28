import type { Instrumentation } from "next";

import { logger } from "@/lib/logger";

export function register() {
  logger.info("application.started", {
    runtime: process.env.NEXT_RUNTIME ?? "unknown",
    version: process.env.APP_VERSION ?? "development",
  });
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  logger.error("request.failed", {
    digest,
    method: request.method,
    path: request.path.split("?", 1)[0],
    route: context.routePath,
    routeType: context.routeType,
  });
};
