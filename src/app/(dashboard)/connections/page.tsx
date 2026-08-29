import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Plus } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentSession } from "@/features/auth/server/session";
import { ConnectionList } from "@/features/connections/components/connection-list";
import { getActiveOrganization } from "@/features/organizations/server/active-organization";

export const metadata: Metadata = {
  title: "Connections",
};

export default async function ConnectionsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/sign-in");
  }

  const { activeOrg } = await getActiveOrganization(session.user.id);

  return (
    <PageContainer
      title="Connections"
      description="Establish and manage authenticated cloud provider integrations with encrypted credential storage."
    >
      {activeOrg ? (
        <ConnectionList organizationId={activeOrg.id} role={activeOrg.role} />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Building2 className="size-5" />
              </div>
              <div>
                <CardTitle>No Active Organization</CardTitle>
                <CardDescription>
                  You must belong to an active organization to establish cloud
                  provider connections.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/create-organization">
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Create an Organization
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
