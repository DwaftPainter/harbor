import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordRecoveryForm } from "@/features/auth/components/password-recovery-form";
import { getCurrentSession } from "@/features/auth/server/session";

export const metadata: Metadata = { title: "Recover password" };

export default async function ForgotPasswordPage() {
  if (await getCurrentSession()) {
    redirect("/");
  }

  return (
    <AuthShell
      title="Recover your account"
      description="Enter your email address and we will send a time-limited recovery link."
    >
      <PasswordRecoveryForm mode="request" />
    </AuthShell>
  );
}
