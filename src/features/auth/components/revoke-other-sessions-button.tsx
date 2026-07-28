"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function RevokeOtherSessionsButton() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function revokeOtherSessions() {
    setIsPending(true);
    setMessage(null);

    try {
      const result = await authClient.revokeOtherSessions();
      setMessage(
        result.error
          ? "Other sessions could not be revoked. Try again."
          : "Other sessions have been revoked.",
      );
    } catch {
      setMessage("Other sessions could not be revoked. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <Button
        disabled={isPending}
        onClick={revokeOtherSessions}
        type="button"
        variant="outline"
      >
        {isPending ? "Revoking…" : "Sign out other sessions"}
      </Button>
      <div aria-live="polite" className="mt-2 min-h-5">
        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
