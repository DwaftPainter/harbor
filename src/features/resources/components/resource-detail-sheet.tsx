"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Database,
  Globe,
  HardDrive,
  Network,
  Server,
  X,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { ResourceDetailDTO, ResourceKind } from "../types";
import { ResourceStatusBadge } from "./resource-status-badge";

interface ResourceDetailSheetProps {
  organizationId: string;
  resourceId: string | null;
  onClose: () => void;
}

export function ResourceDetailSheet({
  organizationId,
  resourceId,
  onClose,
}: ResourceDetailSheetProps) {
  const [detail, setDetail] = useState<ResourceDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) return;

    let ignore = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/organizations/${organizationId}/resources/${resourceId}`,
        );
        if (!ignore) {
          const json = await res.json();
          if (res.ok) {
            setDetail(json.data);
          } else {
            setError(json.error || "Failed to load resource details");
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Network error");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [organizationId, resourceId]);

  if (!resourceId) return null;

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
      case "storage":
        return <HardDrive className="size-4 text-rose-500" />;
      case "domain":
        return <Network className="size-4 text-indigo-500" />;
      default:
        return <Boxes className="text-primary size-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 p-0 backdrop-blur-xs sm:p-4">
      <div className="bg-background flex h-full w-full flex-col justify-between overflow-y-auto rounded-none border p-6 shadow-2xl sm:h-[95vh] sm:max-w-xl sm:rounded-lg">
        <div>
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Resource Details
              </h3>
              <p className="text-muted-foreground text-xs">
                Normalized cloud infrastructure entity and provenance.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
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

          {isLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          ) : detail ? (
            <div className="space-y-6 py-4 text-xs">
              {/* Header Info */}
              <div className="bg-muted/40 flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-background rounded-lg border p-2.5 shadow-xs">
                    {getKindIcon(detail.resourceKind)}
                  </div>
                  <div>
                    <h4 className="text-foreground flex items-center gap-2 text-base font-semibold">
                      {detail.name}
                      {detail.isStale && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/20 px-1 py-0 text-[10px] text-amber-500"
                        >
                          Stale
                        </Badge>
                      )}
                    </h4>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {detail.externalId}
                    </span>
                  </div>
                </div>
                <ResourceStatusBadge status={detail.normalizedStatus} />
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card space-y-1 rounded-md border p-3">
                  <span className="text-muted-foreground text-[11px]">
                    Provider
                  </span>
                  <p className="text-foreground font-semibold capitalize">
                    {detail.providerId}
                  </p>
                </div>
                <div className="bg-card space-y-1 rounded-md border p-3">
                  <span className="text-muted-foreground text-[11px]">
                    Connection
                  </span>
                  <p className="text-foreground font-semibold">
                    {detail.connectionName || "Primary"}
                  </p>
                </div>
                <div className="bg-card space-y-1 rounded-md border p-3">
                  <span className="text-muted-foreground text-[11px]">
                    Raw Status
                  </span>
                  <p className="text-foreground font-mono font-medium">
                    {detail.status || "n/a"}
                  </p>
                </div>
                <div className="bg-card space-y-1 rounded-md border p-3">
                  <span className="text-muted-foreground text-[11px]">
                    Last Observed
                  </span>
                  <p className="text-foreground">
                    {new Date(detail.lastSeenAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Relationships */}
              <div className="space-y-3">
                <h5 className="text-foreground text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Relationships
                </h5>

                {detail.outgoingRelationships.length === 0 &&
                detail.incomingRelationships.length === 0 ? (
                  <div className="text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs">
                    No related resources linked.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detail.outgoingRelationships.map((rel) => (
                      <div
                        key={rel.id}
                        className="bg-card flex items-center justify-between rounded-md border p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">
                            {detail.name}
                          </span>
                          <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
                            {rel.relationshipType}
                          </span>
                          <ArrowRight className="text-muted-foreground size-3" />
                          <span className="text-foreground font-medium">
                            {rel.relatedResource?.name || rel.targetResourceId}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] capitalize"
                        >
                          {rel.relatedResource?.resourceKind || "resource"}
                        </Badge>
                      </div>
                    ))}

                    {detail.incomingRelationships.map((rel) => (
                      <div
                        key={rel.id}
                        className="bg-card flex items-center justify-between rounded-md border p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">
                            {rel.relatedResource?.name || rel.sourceResourceId}
                          </span>
                          <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
                            {rel.relationshipType}
                          </span>
                          <ArrowRight className="text-muted-foreground size-3" />
                          <span className="text-foreground font-medium">
                            {detail.name}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] capitalize"
                        >
                          {rel.relatedResource?.resourceKind || "resource"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata Viewer */}
              <div className="space-y-2">
                <h5 className="text-foreground text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Sanitized Metadata
                </h5>
                <pre className="bg-muted/60 text-muted-foreground max-h-48 overflow-x-auto rounded-lg border p-3 font-mono text-[11px]">
                  {JSON.stringify(detail.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
