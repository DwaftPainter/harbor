"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);

    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          window.location.replace("/sign-in");
        },
      },
    });

    setIsPending(false);
  }

  return (
    <Button
      aria-label="Sign out"
      disabled={isPending}
      onClick={signOut}
      size="icon-sm"
      title="Sign out"
      type="button"
      variant="ghost"
    >
      <LogOut aria-hidden="true" className="size-4" />
    </Button>
  );
}
