"use client";

import { useCallback, useState } from "react";
import { Boxes, Database, Globe, RefreshCw, Server, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { DiscoveredResourceDTO, ResourceKind } from "../types";

interface DiscoveredResourcesDialogProps {
  organizationId: string;
  connectionId: string;
  connectionName: string;
  trigger?: React.ReactNode;
}

export function DiscoveredResourcesDialog({
  organizationId,
  connectionId,
  connectionName,
  trigger,
}: DiscoveredResourcesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resources, setResources] = useState<DiscoveredResourceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/connections/${connectionId}/resources`,
      );
      const json = await res.json();
      if (res.ok) {
        setResources(json.data || []);
      } else {
        setError(json.error || "Failed to load discovered resources");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, connectionId]);

  const handleOpen = () => {
    setIsOpen(true);
    fetchResources();
  };

  const getKindIcon = (kind: ResourceKind) => {
    switch (kind) {
      case "database":
        return <Database className="size-4 text-emerald-500" />;
      case "project":
        return <Boxes className="size-4 text-sky-500" />;
      case "service":
        return <Server className="size-4 text-purple-500" />;
      case "deployment":
        return <Globe className="size-4 text-amber-500" />;
      default:
        return <Boxes className="text-primary size-4" />;
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
          <Boxes className="size-3.5" /> Resources
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Discovered Resources
                </h3>
                <p className="text-muted-foreground text-xs">
                  Synchronized inventory from{" "}
                  <span className="text-foreground font-medium">
                    {connectionName}
                  </span>
                  .
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full rounded-md" />
                  <Skeleton className="h-14 w-full rounded-md" />
                </div>
              ) : resources.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                  No resources discovered yet. Trigger a sync to scan external
                  infrastructure.
                </div>
              ) : (
                resources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-card hover:bg-muted/30 flex items-center justify-between rounded-lg border p-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted rounded-md p-2">
                        {getKindIcon(res.resourceKind)}
                      </div>
                      <div>
                        <div className="text-foreground flex items-center gap-2 font-semibold">
                          {res.name}
                          {res.isStale && (
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 px-1 py-0 text-[10px] text-amber-500"
                            >
                              Stale
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground font-mono text-[11px]">
                          {res.externalId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {res.resourceKind}
                      </Badge>
                      {res.status && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 capitalize"
                        >
                          {res.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchResources}
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
