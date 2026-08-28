"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Database,
  Globe,
  HardDrive,
  Network,
  RefreshCw,
  Server,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type {
  ExternalResourceDTO,
  ResourceFilterInput,
  ResourceKind,
} from "../types";
import { ResourceDetailSheet } from "./resource-detail-sheet";
import { ResourceFilterBar } from "./resource-filter-bar";
import { ResourceStatusBadge } from "./resource-status-badge";

interface ResourceInventoryTableProps {
  organizationId: string;
}

export function ResourceInventoryTable({
  organizationId,
}: ResourceInventoryTableProps) {
  const [resources, setResources] = useState<ExternalResourceDTO[]>([]);
  const [filters, setFilters] = useState<ResourceFilterInput>({ pageSize: 15 });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.providerId) params.set("providerId", filters.providerId);
    if (filters.connectionId) params.set("connectionId", filters.connectionId);
    if (filters.kind) params.set("kind", filters.kind);
    if (filters.status) params.set("status", filters.status);
    if (filters.isStale !== undefined)
      params.set("isStale", String(filters.isStale));
    if (filters.search) params.set("search", filters.search);
    if (filters.cursor) params.set("cursor", filters.cursor);
    if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/resources?${params.toString()}`,
      );
      const json = await res.json();

      if (res.ok) {
        setResources(json.data || []);
        setNextCursor(json.page?.nextCursor || null);
        setHasMore(Boolean(json.page?.hasMore));
      } else {
        setError(json.error || "Failed to load resource inventory");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, filters]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const params = new URLSearchParams();
      if (filters.providerId) params.set("providerId", filters.providerId);
      if (filters.connectionId)
        params.set("connectionId", filters.connectionId);
      if (filters.kind) params.set("kind", filters.kind);
      if (filters.status) params.set("status", filters.status);
      if (filters.isStale !== undefined)
        params.set("isStale", String(filters.isStale));
      if (filters.search) params.set("search", filters.search);
      if (filters.cursor) params.set("cursor", filters.cursor);
      if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

      try {
        const res = await fetch(
          `/api/organizations/${organizationId}/resources?${params.toString()}`,
        );
        if (!ignore) {
          const json = await res.json();
          if (res.ok) {
            setResources(json.data || []);
            setNextCursor(json.page?.nextCursor || null);
            setHasMore(Boolean(json.page?.hasMore));
          } else {
            setError(json.error || "Failed to load resource inventory");
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
  }, [organizationId, filters]);

  const handleNextPage = () => {
    if (!nextCursor) return;
    setCursorHistory((prev) => [...prev, filters.cursor || ""]);
    setFilters((prev) => ({ ...prev, cursor: nextCursor }));
  };

  const handlePrevPage = () => {
    if (cursorHistory.length === 0) return;
    const prevCursor = cursorHistory[cursorHistory.length - 1];
    setCursorHistory((prev) => prev.slice(0, -1));
    setFilters((prev) => ({
      ...prev,
      cursor: prevCursor ? prevCursor : undefined,
    }));
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
      case "storage":
        return <HardDrive className="size-4 text-rose-500" />;
      case "domain":
        return <Network className="size-4 text-indigo-500" />;
      default:
        return <Boxes className="text-primary size-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <ResourceFilterBar
        filters={filters}
        onChange={(newFilters) => {
          setCursorHistory([]);
          setFilters(newFilters);
        }}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground border-b font-medium">
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Kind</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Normalized Status</th>
                  <th className="px-4 py-3">Last Observed</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : resources.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground p-12 text-center"
                    >
                      No resources found matching the specified filters.
                    </td>
                  </tr>
                ) : (
                  resources.map((res) => (
                    <tr
                      key={res.id}
                      onClick={() => setSelectedResourceId(res.id)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-muted rounded-md p-1.5">
                            {getKindIcon(res.resourceKind)}
                          </div>
                          <div>
                            <div className="text-foreground flex items-center gap-1.5 font-semibold">
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
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="capitalize">
                          {res.resourceKind}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground font-medium capitalize">
                          {res.providerId}
                        </span>
                        {res.connectionName && (
                          <span className="text-muted-foreground block text-[11px]">
                            {res.connectionName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ResourceStatusBadge status={res.normalizedStatus} />
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {new Date(res.lastSeenAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResourceId(res.id);
                          }}
                          className="h-7 text-xs"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination & Refresh Bar */}
      <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={cursorHistory.length === 0 || isLoading}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="size-3.5" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore || isLoading}
            className="h-8 gap-1 text-xs"
          >
            Next <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Resource Detail Slide-Over Sheet */}
      <ResourceDetailSheet
        organizationId={organizationId}
        resourceId={selectedResourceId}
        onClose={() => setSelectedResourceId(null)}
      />
    </div>
  );
}
