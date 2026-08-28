"use client";

import { useCallback, useState } from "react";
import { History, Loader2, Play, RefreshCw, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { SyncRunDTO } from "../types";
import { SyncStatusBadge } from "./sync-status-badge";

interface SyncHistoryDialogProps {
  organizationId: string;
  connectionId: string;
  connectionName: string;
  canSync?: boolean;
  onSyncComplete?: () => void;
  trigger?: React.ReactNode;
}

export function SyncHistoryDialog({
  organizationId,
  connectionId,
  connectionName,
  canSync,
  onSyncComplete,
  trigger,
}: SyncHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [runs, setRuns] = useState<SyncRunDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/connections/${connectionId}/sync`,
      );
      const json = await res.json();
      if (res.ok) {
        setRuns(json.data || []);
      } else {
        setError(json.error || "Failed to load sync history");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, connectionId]);

  const handleOpen = () => {
    setIsOpen(true);
    fetchRuns();
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/connections/${connectionId}/sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ capability: "full", trigger: "manual" }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to trigger sync");
      }
      await fetchRuns();
      onSyncComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen}>{trigger}</span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="gap-1.5"
        >
          <History className="size-3.5" /> History
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Synchronization History
                </h3>
                <p className="text-muted-foreground text-xs">
                  Recent sync runs and inventory observations for{" "}
                  <span className="text-foreground font-medium">
                    {connectionName}
                  </span>
                  .
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canSync && (
                  <Button
                    size="sm"
                    onClick={handleTriggerSync}
                    disabled={isSyncing || isLoading}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {isSyncing ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Play className="size-3.5" />
                    )}
                    Sync Now
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="size-8"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full rounded-md" />
                  <Skeleton className="h-16 w-full rounded-md" />
                </div>
              ) : runs.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                  No synchronization runs recorded yet.
                </div>
              ) : (
                runs.map((run) => (
                  <div
                    key={run.id}
                    className="bg-card hover:bg-muted/30 space-y-2 rounded-lg border p-3 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SyncStatusBadge status={run.status} />
                        <span className="text-foreground font-medium capitalize">
                          {run.capability} Sync
                        </span>
                        <span className="text-muted-foreground">
                          ({run.trigger})
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(run.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div className="text-muted-foreground grid grid-cols-4 gap-2 pt-1">
                      <div>
                        Observed:{" "}
                        <span className="text-foreground font-medium">
                          {run.itemsObserved}
                        </span>
                      </div>
                      <div>
                        Created:{" "}
                        <span className="font-medium text-emerald-500">
                          {run.itemsCreated}
                        </span>
                      </div>
                      <div>
                        Updated:{" "}
                        <span className="font-medium text-sky-500">
                          {run.itemsUpdated}
                        </span>
                      </div>
                      <div>
                        Duration:{" "}
                        <span className="text-foreground font-medium">
                          {run.durationMs !== null &&
                          run.durationMs !== undefined
                            ? `${(run.durationMs / 1000).toFixed(1)}s`
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {run.errorSummary && (
                      <div className="bg-destructive/10 text-destructive rounded p-2">
                        <span className="font-medium">Error:</span>{" "}
                        {run.errorSummary}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRuns}
                disabled={isLoading}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw
                  className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
