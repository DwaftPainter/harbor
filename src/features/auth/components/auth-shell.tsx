import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  children: React.ReactNode;
  description: string;
  title: string;
}

export function AuthShell({ children, description, title }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link className="mb-8 flex items-center justify-center gap-3" href="/">
          <span className="bg-primary flex size-9 items-center justify-center rounded-lg text-sm font-semibold text-white">
            H
          </span>
          <span className="font-semibold">Harbor</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
            <CardDescription className="leading-6">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
