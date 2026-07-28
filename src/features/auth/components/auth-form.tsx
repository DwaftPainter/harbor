"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

interface AuthFormProps {
  mode: AuthMode;
}

const GENERIC_ERROR =
  "We could not complete that request. Check your details and try again.";

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name: String(formData.get("name") ?? "").trim(),
            email,
            password,
            callbackURL: "/",
          })
        : await authClient.signIn.email({
            email,
            password,
            rememberMe: formData.get("rememberMe") === "on",
            callbackURL: "/",
          });

      if (result.error) {
        setMessage(GENERIC_ERROR);
        return;
      }

      window.location.replace("/");
    } catch {
      setMessage(GENERIC_ERROR);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {isSignUp ? (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            autoComplete="name"
            className="h-10"
            id="name"
            maxLength={80}
            minLength={2}
            name="name"
            required
            type="text"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          autoCapitalize="none"
          autoComplete="email"
          className="h-10"
          id="email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="h-10"
          id="password"
          maxLength={128}
          minLength={12}
          name="password"
          required
          type="password"
        />
        {isSignUp ? (
          <p className="text-muted-foreground text-xs">
            Use at least 12 characters.
          </p>
        ) : null}
      </div>

      {!isSignUp ? (
        <div className="flex items-center gap-2">
          <Checkbox
            defaultChecked
            id="rememberMe"
            name="rememberMe"
            value="on"
          />
          <Label className="font-normal" htmlFor="rememberMe">
            Keep me signed in
          </Label>
        </div>
      ) : null}

      <div aria-live="polite" className="min-h-5">
        {message ? (
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <Button className="h-10 w-full" disabled={isPending} type="submit">
        {isPending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {isSignUp ? "Already have an account?" : "New to Harbor?"}{" "}
        <Link
          className="text-foreground font-medium underline-offset-4 hover:underline"
          href={isSignUp ? "/sign-in" : "/sign-up"}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
