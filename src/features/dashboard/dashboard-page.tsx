import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";

export function DashboardPage() {
  return (
    <PageContainer
      title="Dashboard"
      description="A unified view of your cloud applications and infrastructure."
    >
      <EmptyState
        icon={LayoutDashboard}
        title="Your control plane is ready"
        description="Connect a cloud provider when integrations become available to begin managing resources with Harbor."
      />
    </PageContainer>
  );
}
