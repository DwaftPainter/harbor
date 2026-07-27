import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <div className="md:pl-64">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
