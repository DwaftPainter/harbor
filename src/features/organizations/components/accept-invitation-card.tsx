"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AcceptInvitationCardProps {
  token: string;
  isAuthenticated: boolean;
}

interface InvitationPreview {
  valid: boolean;
  reason?: "expired" | "consumed" | "not_found";
  invitation?: {
    email: string;
    role: string;
    expiresAt: string;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  inviter?: {
    name: string;
    email: string;
  };
}

export function AcceptInvitationCard({
  token,
  isAuthenticated,
}: AcceptInvitationCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(Boolean(token));
  const [preview, setPreview] = React.useState<InvitationPreview | null>(null);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [accepted, setAccepted] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;

    async function loadInvite() {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();
        if (!ignore) {
          setPreview(data.data);
        }
      } catch (err) {
        if (!ignore) {
          setError("Failed to verify invitation token.");
          console.error(err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (token) {
      void loadInvite();
    }

    return () => {
      ignore = true;
    };
  }, [token]);

  async function handleAccept() {
    try {
      setIsAccepting(true);
      setError(null);

      const res = await fetch(`/api/invitations/${token}`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      setAccepted(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept invitation",
      );
    } finally {
      setIsAccepting(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center text-sm">
          <Loader2 className="text-primary size-6 animate-spin" />
          <p>Verifying invitation token...</p>
        </CardContent>
      </Card>
    );
  }

  if (!preview || !preview.valid) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 text-destructive mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <XCircle className="size-6" />
          </div>
          <CardTitle>Invalid or Expired Invitation</CardTitle>
          <CardDescription>
            {preview?.reason === "expired"
              ? "This invitation has expired. Please ask the organization owner to send a new invite."
              : preview?.reason === "consumed"
                ? "This invitation has already been accepted or revoked."
                : "This invitation link is invalid or does not exist."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/sign-in">
            <Button variant="outline">Return to Sign In</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (accepted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle>Invitation Accepted!</CardTitle>
          <CardDescription>
            You have joined{" "}
            <span className="text-foreground font-semibold">
              {preview.organization?.name}
            </span>
            . Redirecting you to the dashboard...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-xl">
          <Building2 className="size-6" />
        </div>
        <CardTitle>Join {preview.organization?.name}</CardTitle>
        <CardDescription>
          <span className="text-foreground font-medium">
            {preview.inviter?.name || "A team member"}
          </span>{" "}
          has invited you to join their organization as a{" "}
          <Badge variant="outline" className="text-xs capitalize">
            {preview.invitation?.role}
          </Badge>
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/30 space-y-1 rounded-md border p-3 text-xs">
          <div className="text-muted-foreground flex justify-between">
            <span>Recipient Email:</span>
            <span className="text-foreground font-medium">
              {preview.invitation?.email}
            </span>
          </div>
          <div className="text-muted-foreground flex justify-between">
            <span>Organization Slug:</span>
            <span className="text-foreground font-mono">
              {preview.organization?.slug}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {isAuthenticated ? (
          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Joining Organization...
              </>
            ) : (
              "Accept & Join Organization"
            )}
          </Button>
        ) : (
          <div className="w-full space-y-2 text-center">
            <Link
              href={`/sign-in?callbackURL=${encodeURIComponent(`/accept-invitation?token=${token}`)}`}
              className="block w-full"
            >
              <Button className="w-full">Sign In to Accept</Button>
            </Link>
            <p className="text-muted-foreground text-xs">
              Don&apos;t have an account yet?{" "}
              <Link
                href={`/sign-up?callbackURL=${encodeURIComponent(`/accept-invitation?token=${token}`)}`}
                className="text-primary underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
