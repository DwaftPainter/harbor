import { Boxes } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { PageContainer } from "@/components/page-container";
import { ApplicationList } from "@/features/applications/components/application-list";
import { getCurrentSession } from "@/features/auth/server/session";
import { getActiveOrganization } from "@/features/organizations/server/active-organization";

export const metadata: Metadata = {
  title: "Applications — Harbor",
};

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  await connection();
  const session = await getCurrentSession();
  const { activeOrg } = session?.user
    ? await getActiveOrganization(session.user.id)
    : { activeOrg: null };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h2 className="text-foreground flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <Boxes className="text-primary size-6" /> Applications
          </h2>
          <p className="text-muted-foreground text-sm">
            Logical software applications grouped across environments and bound
            cloud resources.
          </p>
        </div>

        {activeOrg ? (
          <ApplicationList organizationId={activeOrg.id} />
        ) : (
          <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
            No active organization selected. Please select or create an
            organization to view applications.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
