import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { PasswordRecoveryForm } from "@/features/auth/components/password-recovery-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    token?: string | string[];
  }>;
}) {
  const { error, token } = await searchParams;

  return (
    <AuthShell
      title="Choose a new password"
      description="Recovery links are single-use and expire after one hour."
    >
      <PasswordRecoveryForm
        error={typeof error === "string" ? error : undefined}
        mode="reset"
        token={typeof token === "string" ? token : undefined}
      />
    </AuthShell>
  );
}
