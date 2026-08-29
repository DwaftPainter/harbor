import { Layers } from "lucide-react";
import { connection } from "next/server";

import { PageContainer } from "@/components/page-container";
import { getCurrentSession } from "@/features/auth/server/session";
import { getActiveOrganization } from "@/features/organizations/server/active-organization";
import { ResourceInventoryTable } from "@/features/resources/components/resource-inventory-table";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
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
            <Layers className="text-primary size-6" /> Resource Inventory
          </h2>
          <p className="text-muted-foreground text-sm">
            Unified, tenant-safe catalog of synchronized cloud provider
            infrastructure and normalized entities.
          </p>
        </div>

        {activeOrg ? (
          <ResourceInventoryTable organizationId={activeOrg.id} />
        ) : (
          <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
            No active organization selected. Please select or create an
            organization to view cloud resources.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
