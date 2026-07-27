import type { Metadata } from "next";
import { Boxes } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";

export const metadata: Metadata = {
  title: "Applications",
};

export default function ApplicationsPage() {
  return (
    <PageContainer
      title="Applications"
      description="Manage applications across connected cloud providers."
    >
      <EmptyState
        icon={Boxes}
        title="No applications yet"
        description="Applications will appear here after you connect a provider."
      />
    </PageContainer>
  );
}
