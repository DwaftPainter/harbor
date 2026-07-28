import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardContent>
          <p className="text-muted-foreground text-sm font-medium">404</p>
          <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            The page may have moved or the address may be incorrect.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Return to Harbor</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
