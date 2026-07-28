import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentSession } from "@/features/auth/server/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="md:pl-64">
        <Header userName={session.user.name} userEmail={session.user.email} />
        <main>{children}</main>
      </div>
    </div>
  );
}
