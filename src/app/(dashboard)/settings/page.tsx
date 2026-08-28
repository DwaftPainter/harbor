import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Plus } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuditLogViewer } from "@/features/audit/components/audit-log-viewer";
import { hasPermission } from "@/features/authorization/permissions";
import { SessionManager } from "@/features/auth/components/session-manager";
import { getCurrentSession } from "@/features/auth/server/session";
import { OrganizationSettings } from "@/features/organizations/components/organization-settings";
import { getActiveOrganization } from "@/features/organizations/server/active-organization";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { activeOrg } = await getActiveOrganization(session.user.id);

  const initials =
    session.user.name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const canViewAudit = activeOrg && hasPermission(activeOrg.role, "audit:read");

  return (
    <PageContainer
      title="Settings"
      description="Manage your personal identity, sessions, organization, and security audit log."
    >
      <div className="max-w-4xl space-y-8">
        {/* Organization Settings Section */}
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            Organization
          </h2>
          {activeOrg ? (
            <OrganizationSettings
              currentUserId={session.user.id}
              activeOrg={activeOrg}
            />
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
                      You are not currently a member of any organization. Create
                      one to begin managing applications and infrastructure.
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
        </div>

        {/* Audit Log Section (Owners & Admins only) */}
        {activeOrg && canViewAudit && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                Security & Audit
              </h2>
              <AuditLogViewer organizationId={activeOrg.id} />
            </div>
          </>
        )}

        <Separator />

        {/* Account & Identity Section */}
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">
            Account & Identity
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                The personal profile attached to your Harbor account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <dl className="grid min-w-0 flex-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="mt-1 truncate font-medium">
                      {session.user.name}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="mt-1 truncate font-medium">
                      {session.user.email}
                    </dd>
                  </div>
                </dl>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold">Active Sessions</h3>
                <p className="text-muted-foreground mt-1 mb-4 text-xs leading-5">
                  Review active browsers and devices, then revoke any session
                  you no longer trust.
                </p>
                <SessionManager currentSessionId={session.session.id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
