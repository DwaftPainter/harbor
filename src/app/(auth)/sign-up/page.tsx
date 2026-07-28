import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { getCurrentSession } from "@/features/auth/server/session";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignUpPage() {
  if (await getCurrentSession()) {
    redirect("/");
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start with a secure Harbor identity. Organization access is configured separately."
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
