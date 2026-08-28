import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { getCurrentSession } from "@/features/auth/server/session";
import { AcceptInvitationCard } from "@/features/organizations/components/accept-invitation-card";

export const metadata: Metadata = {
  title: "Accept Invitation",
};

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getCurrentSession();
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Organization Invitation"
      description="You have been invited to collaborate on Harbor."
    >
      <AcceptInvitationCard
        token={token ?? ""}
        isAuthenticated={Boolean(session)}
      />
    </AuthShell>
  );
}
