import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { getCurrentSession } from "@/features/auth/server/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  if (await getCurrentSession()) {
    redirect("/");
  }

  const { reset } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in with your Harbor account to continue."
    >
      <AuthForm
        initialMessage={
          reset === "success"
            ? "Your password was reset. Sign in with your new password."
            : undefined
        }
        mode="sign-in"
      />
    </AuthShell>
  );
}
