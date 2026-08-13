import "server-only";

import { Resend } from "resend";

import { getServerEnv } from "@/env";

interface AuthEmail {
  action: string;
  subject: string;
  to: string;
  url: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function sendAuthEmail({ action, subject, to, url }: AuthEmail) {
  const env = getServerEnv();

  if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) {
    throw new Error("Authentication email delivery is not configured");
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const safeUrl = escapeHtml(url);
  const response = await resend.emails.send({
    from: env.AUTH_EMAIL_FROM,
    to,
    subject,
    text: `${action}: ${url}`,
    html: `<p>${escapeHtml(action)}</p><p><a href="${safeUrl}">${safeUrl}</a></p>`,
  });

  if (response.error) {
    throw new Error("Authentication email delivery failed");
  }
}
