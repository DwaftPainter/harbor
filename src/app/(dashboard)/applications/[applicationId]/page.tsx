import type { Metadata } from "next";
import { connection } from "next/server";

import { PageContainer } from "@/components/page-container";
import { ApplicationOverview } from "@/features/applications/components/application-overview";
import { getCurrentSession } from "@/features/auth/server/session";
import { getActiveOrganization } from "@/features/organizations/server/active-organization";

interface PageParams {
  params: Promise<{ applicationId: string }>;
}

export const metadata: Metadata = {
  title: "Application Details — Harbor",
};

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: PageParams) {
  await connection();
  const session = await getCurrentSession();
  const { activeOrg } = session?.user
    ? await getActiveOrganization(session.user.id)
    : { activeOrg: null };

  const { applicationId } = await params;

  return (
    <PageContainer>
      {activeOrg ? (
        <ApplicationOverview
          organizationId={activeOrg.id}
          applicationId={applicationId}
        />
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          No active organization selected.
        </div>
      )}
    </PageContainer>
  );
}
