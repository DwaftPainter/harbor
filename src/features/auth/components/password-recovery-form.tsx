"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface PasswordRecoveryFormProps {
  error?: string;
  mode: "request" | "reset";
  token?: string;
}

const GENERIC_ERROR = "We could not complete that request. Try again.";

export function PasswordRecoveryForm({
  error,
  mode,
  token,
}: PasswordRecoveryFormProps) {
  const isRequest = mode === "request";
  const invalidLink = !isRequest && (!token || Boolean(error));
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(
    invalidLink ? "This recovery link is invalid or expired." : null,
  );
  const [isError, setIsError] = useState(Boolean(invalidLink));
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) {
      messageRef.current?.focus();
    }
  }, [message]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setIsError(false);

    const formData = new FormData(event.currentTarget);

    try {
      if (isRequest) {
        const result = await authClient.requestPasswordReset({
          email: String(formData.get("email") ?? "").trim(),
          redirectTo: "/reset-password",
        });

        if (result.error) {
          setIsError(true);
          setMessage(GENERIC_ERROR);
          return;
        }

        setMessage(
          "If an account exists for that email, a recovery link is on its way.",
        );
        return;
      }

      if (!token) {
        setIsError(true);
        setMessage("This recovery link is invalid or expired.");
        return;
      }

      const password = String(formData.get("password") ?? "");
      const confirmation = String(formData.get("confirmation") ?? "");

      if (password !== confirmation) {
        setIsError(true);
        setMessage("The passwords do not match.");
        return;
      }

      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setIsError(true);
        setMessage("This recovery link is invalid or expired.");
        return;
      }

      window.location.replace("/sign-in?reset=success");
    } catch {
      setIsError(true);
      setMessage(GENERIC_ERROR);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isRequest ? (
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            autoCapitalize="none"
            autoComplete="email"
            className="h-11"
            id="email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              autoComplete="new-password"
              className="h-11"
              disabled={invalidLink}
              id="password"
              maxLength={128}
              minLength={12}
              name="password"
              required
              type="password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmation">Confirm new password</Label>
            <Input
              autoComplete="new-password"
              className="h-11"
              disabled={invalidLink}
              id="confirmation"
              maxLength={128}
              minLength={12}
              name="confirmation"
              required
              type="password"
            />
          </div>
        </>
      )}

      <div aria-live="polite" className="min-h-5">
        {message ? (
          <Alert
            ref={messageRef}
            role={isError ? "alert" : "status"}
            tabIndex={-1}
            variant={isError ? "destructive" : "default"}
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      {!invalidLink ? (
        <Button className="h-11 w-full" disabled={isPending} type="submit">
          {isPending
            ? "Please wait…"
            : isRequest
              ? "Send recovery link"
              : "Reset password"}
        </Button>
      ) : null}

      <p className="text-muted-foreground text-center text-sm">
        <Link
          className="text-foreground inline-flex min-h-11 items-center font-medium underline-offset-4 hover:underline"
          href={isRequest ? "/sign-in" : "/forgot-password"}
        >
          {isRequest ? "Back to sign in" : "Request a new recovery link"}
        </Link>
      </p>
    </form>
  );
}
