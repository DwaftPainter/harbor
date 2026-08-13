import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SessionManager } from "@/features/auth/components/session-manager";
import { getCurrentSession } from "@/features/auth/server/session";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  const initials =
    session.user.name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <PageContainer
      title="Account settings"
      description="Review your identity and secure your active sessions."
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>
            The profile attached to your Harbor account.
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
            <h2 className="font-semibold">Sessions</h2>
            <p className="text-muted-foreground mt-2 mb-4 text-sm leading-6">
              Review active browsers and devices, then revoke any session you no
              longer trust.
            </p>
            <SessionManager currentSessionId={session.session.id} />
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
