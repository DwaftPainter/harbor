import "server-only";

import { logger } from "@/lib/logger";

const AUTH_EVENTS = new Map([
  ["/sign-up/email", "auth.sign_up"],
  ["/sign-in/email", "auth.sign_in"],
  ["/sign-out", "auth.sign_out"],
  ["/request-password-reset", "auth.password_reset_requested"],
  ["/reset-password", "auth.password_reset"],
  ["/verify-email", "auth.email_verification"],
  ["/send-verification-email", "auth.email_verification_requested"],
  ["/revoke-session", "auth.session_revocation"],
  ["/revoke-sessions", "auth.session_revocation"],
  ["/revoke-other-sessions", "auth.session_revocation"],
]);

function getAuthEvent(pathname: string) {
  if (pathname.startsWith("/reset-password/")) {
    return "auth.password_reset_link_opened";
  }

  return AUTH_EVENTS.get(pathname);
}

export function recordAuthOutcome({
  durationMs,
  method,
  pathname,
  status,
}: {
  durationMs: number;
  method: string;
  pathname: string;
  status: number;
}) {
  const event = getAuthEvent(pathname);

  if (!event) {
    return;
  }

  const fields = {
    durationMs: Math.round(durationMs),
    method,
    outcome: status >= 200 && status < 400 ? "success" : "failure",
    status,
  };

  if (status >= 500) {
    logger.error(event, fields);
    return;
  }

  if (status === 429 || status >= 400) {
    logger.warn(event, fields);
    return;
  }

  logger.info(event, fields);
}
