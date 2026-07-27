import type { Metadata } from "next";
import { Cable } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";

export const metadata: Metadata = {
  title: "Connections",
};

export default function ConnectionsPage() {
  return (
    <PageContainer
      title="Connections"
      description="Cloud provider connections will be configured here."
    >
      <EmptyState
        icon={Cable}
        title="No providers connected"
        description="Provider connections are intentionally not implemented in this foundation."
      />
    </PageContainer>
  );
}
