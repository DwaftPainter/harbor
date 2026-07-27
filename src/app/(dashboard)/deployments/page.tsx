import type { Metadata } from "next";
import { Rocket } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";

export const metadata: Metadata = {
  title: "Deployments",
};

export default function DeploymentsPage() {
  return (
    <PageContainer
      title="Deployments"
      description="Observe deployments from one control plane."
    >
      <EmptyState
        icon={Rocket}
        title="No deployments yet"
        description="Deployment activity will appear here once providers are connected."
      />
    </PageContainer>
  );
}
