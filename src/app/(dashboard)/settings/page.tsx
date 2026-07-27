import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageContainer } from "@/components/page-container";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="Configure your Harbor workspace."
    >
      <EmptyState
        icon={Settings}
        title="Settings are coming soon"
        description="Workspace settings will be added as the product takes shape."
      />
    </PageContainer>
  );
}
