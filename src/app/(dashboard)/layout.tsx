import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentSession } from "@/features/auth/server/session";
import { getActiveOrganization } from "@/features/organizations/server/active-organization";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { activeOrg, userOrgs } = await getActiveOrganization(session.user.id);

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="md:pl-64">
        <Header
          userName={session.user.name}
          userEmail={session.user.email}
          activeOrg={activeOrg}
          userOrgs={userOrgs}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
