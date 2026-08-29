import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentSession } from "@/features/auth/server/session";
import { CreateOrgForm } from "@/features/organizations/components/create-org-form";

export const metadata: Metadata = {
  title: "Create Organization",
};

export default async function CreateOrganizationPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <PageContainer
      title="Create an Organization"
      description="Organizations are the tenant boundary for applications, environments, and provider connections."
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Enter a name for your organization. You will be assigned as the
            primary Owner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrgForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
