"use client";

import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

type Session = NonNullable<
  Awaited<ReturnType<typeof authClient.listSessions>>["data"]
>[number];

interface SessionManagerProps {
  currentSessionId: string;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}

function getSessionLabel(userAgent: string | null | undefined) {
  return userAgent?.trim().slice(0, 160) || "Unknown browser or device";
}

async function requestSessions() {
  const result = await authClient.listSessions();

  if (result.error || !result.data) {
    throw new Error("Session request failed");
  }

  return result.data;
}

export function SessionManager({ currentSessionId }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      setSessions(await requestSessions());
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    void requestSessions()
      .then((activeSessions) => {
        if (!ignore) {
          setSessions(activeSessions);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function revokeSession(token: string) {
    setPendingToken(token);
    setMessage(null);

    try {
      const result = await authClient.revokeSession({ token });

      if (result.error || !result.data?.status) {
        setMessage("That session could not be revoked. Try again.");
        return;
      }

      setSessions((current) =>
        current.filter((session) => session.token !== token),
      );
      setMessage("The selected session has been revoked.");
    } catch {
      setMessage("That session could not be revoked. Try again.");
    } finally {
      setPendingToken(null);
    }
  }

  async function revokeOtherSessions() {
    setIsRevokingOthers(true);
    setMessage(null);

    try {
      const result = await authClient.revokeOtherSessions();

      if (result.error || !result.data?.status) {
        setMessage("Other sessions could not be revoked. Try again.");
        return;
      }

      setSessions((current) =>
        current.filter((session) => session.id === currentSessionId),
      );
      setMessage("Other sessions have been revoked.");
    } catch {
      setMessage("Other sessions could not be revoked. Try again.");
    } finally {
      setIsRevokingOthers(false);
    }
  }

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading active sessions"
        className="space-y-3"
      >
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>
            Active sessions could not be loaded. Sign in again if your session
            is no longer fresh, then retry.
          </AlertDescription>
        </Alert>
        <Button
          className="min-h-11"
          onClick={loadSessions}
          type="button"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Alert role="status">
        <AlertDescription>No active sessions were found.</AlertDescription>
      </Alert>
    );
  }

  const hasOtherSessions = sessions.some(
    (session) => session.id !== currentSessionId,
  );

  return (
    <div className="space-y-4">
      <ul aria-label="Active sessions" className="divide-y rounded-lg border">
        {sessions.map((session) => {
          const isCurrent = session.id === currentSessionId;
          const isPending = pendingToken === session.token;

          return (
            <li
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={session.id}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium break-words">
                    {getSessionLabel(session.userAgent)}
                  </p>
                  {isCurrent ? (
                    <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs font-medium">
                      Current session
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-sm">
                  Started{" "}
                  <time dateTime={new Date(session.createdAt).toISOString()}>
                    {formatDate(session.createdAt)}
                  </time>
                  {" · "}Expires{" "}
                  <time dateTime={new Date(session.expiresAt).toISOString()}>
                    {formatDate(session.expiresAt)}
                  </time>
                </p>
              </div>

              {!isCurrent ? (
                <Button
                  aria-label={`Revoke session started ${formatDate(session.createdAt)}`}
                  className="min-h-11 sm:self-center"
                  disabled={pendingToken !== null || isRevokingOthers}
                  onClick={() => revokeSession(session.token)}
                  type="button"
                  variant="outline"
                >
                  {isPending ? "Revoking…" : "Revoke"}
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {hasOtherSessions ? (
        <Button
          className="min-h-11"
          disabled={isRevokingOthers || pendingToken !== null}
          onClick={revokeOtherSessions}
          type="button"
          variant="outline"
        >
          {isRevokingOthers ? "Revoking…" : "Sign out all other sessions"}
        </Button>
      ) : null}

      <div aria-live="polite" className="min-h-5">
        {message ? (
          <Alert role="status">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
