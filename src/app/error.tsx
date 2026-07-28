"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardContent>
          <p className="text-muted-foreground text-sm font-medium">
            Unexpected error
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Harbor hit a problem</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Try the request again. If the problem continues, share the support
            reference with your administrator.
          </p>
          {error.digest ? (
            <p className="text-muted-foreground mt-3 font-mono text-xs">
              Reference: {error.digest}
            </p>
          ) : null}
          <Button
            className="mt-6"
            onClick={() => unstable_retry()}
            type="button"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
