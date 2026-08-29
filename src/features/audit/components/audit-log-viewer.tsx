"use client";

import * as React from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Filter,
  Info,
  Loader2,
  RefreshCw,
  Shield,
  X,
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuditEventWithActor } from "@/features/audit/types";

interface AuditLogViewerProps {
  organizationId: string;
}

const PAGE_SIZE = 15;

function formatDate(dateString: Date | string) {
  const d = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(d);
}

function getOutcomeBadge(outcome: string) {
  switch (outcome) {
    case "success":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-3 w-3" />
          Success
        </Badge>
      );
    case "denied":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <AlertCircle className="h-3 w-3" />
          Denied
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
        >
          <XCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    default:
      return <Badge variant="secondary">{outcome}</Badge>;
  }
}

function formatActionName(action: string) {
  return action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" → ");
}

export function AuditLogViewer({ organizationId }: AuditLogViewerProps) {
  const [events, setEvents] = React.useState<AuditEventWithActor[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = React.useState("");
  const [outcomeFilter, setOutcomeFilter] = React.useState("all");

  // Selected event metadata for inspector modal
  const [inspectEvent, setInspectEvent] =
    React.useState<AuditEventWithActor | null>(null);

  const fetchEvents = React.useCallback(
    async (pageNum: number, actionVal: string, outcomeVal: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String((pageNum - 1) * PAGE_SIZE),
        });

        if (actionVal.trim()) {
          params.set("action", actionVal.trim());
        }
        if (outcomeVal !== "all") {
          params.set("outcome", outcomeVal);
        }

        const res = await fetch(
          `/api/organizations/${organizationId}/audit?${params.toString()}`,
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.error || `Failed to fetch audit events (Status ${res.status})`,
          );
        }

        const json = await res.json();
        setEvents(json.data.events || []);
        setTotal(json.data.total || 0);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading audit events.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [organizationId],
  );

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String((page - 1) * PAGE_SIZE),
        });

        if (actionFilter.trim()) {
          params.set("action", actionFilter.trim());
        }
        if (outcomeFilter !== "all") {
          params.set("outcome", outcomeFilter);
        }

        const res = await fetch(
          `/api/organizations/${organizationId}/audit?${params.toString()}`,
        );

        if (!ignore) {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(
              body.error ||
                `Failed to fetch audit events (Status ${res.status})`,
            );
          }

          const json = await res.json();
          setEvents(json.data.events || []);
          setTotal(json.data.total || 0);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load audit events.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [organizationId, page, actionFilter, outcomeFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-border/40 border-b pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="text-primary h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription className="mt-1">
              Immutable timeline of security, membership, and configuration
              actions.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchEvents(page, actionFilter, outcomeFilter)}
            disabled={isLoading}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col items-center gap-3 pt-3 sm:flex-row">
          <div className="relative w-full flex-1">
            <Filter className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Filter by action (e.g. member.invited, organization.updated)..."
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setPage(1);
              }}
              className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="all">All Outcomes</option>
              <option value="success">Success</option>
              <option value="denied">Denied</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {isLoading ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 p-12">
            <Loader2 className="text-primary h-7 w-7 animate-spin" />
            <p className="text-sm">Loading audit events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-muted/60 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Info className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-foreground font-medium">No audit events found</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {actionFilter || outcomeFilter !== "all"
                ? "No records match your filter criteria. Try clearing active filters."
                : "Security-relevant mutations and operations will appear here as they occur."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-border/50 border-b text-xs tracking-wider uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Outcome</th>
                  <th className="px-4 py-3 text-right font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-border/30 divide-y">
                {events.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="text-muted-foreground/70 h-3.5 w-3.5" />
                        {formatDate(evt.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {evt.actor?.name
                              ? evt.actor.name.slice(0, 2).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-foreground text-xs font-medium">
                            {evt.actor?.name || evt.actorEmail || evt.actorType}
                          </span>
                          {evt.actor?.email && (
                            <span className="text-muted-foreground text-[11px]">
                              {evt.actor.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-foreground bg-muted/60 border-border/50 rounded border px-2 py-0.5 font-mono text-xs font-medium">
                        {formatActionName(evt.action)}
                      </span>
                    </td>

                    <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
                      <span className="capitalize">{evt.targetType}</span>
                      {evt.targetId && (
                        <span className="text-muted-foreground/80 ml-1 font-mono text-[10px]">
                          ({evt.targetId.slice(0, 8)}...)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {getOutcomeBadge(evt.outcome)}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {evt.metadata && Object.keys(evt.metadata).length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectEvent(evt)}
                          className="h-7 gap-1 px-2 text-xs"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          Inspect
                        </Button>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">
                          None
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {total > 0 && (
          <div className="border-border/40 bg-muted/20 text-muted-foreground flex items-center justify-between border-t px-4 py-3 text-xs">
            <div>
              Showing{" "}
              <span className="text-foreground font-medium">
                {(page - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="text-foreground font-medium">
                {Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of <span className="text-foreground font-medium">{total}</span>{" "}
              events
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="text-foreground px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="h-7 px-2"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Metadata Inspector Modal */}
      {inspectEvent && (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="border-border bg-card relative w-full max-w-lg rounded-xl border p-6 shadow-2xl">
            <button
              onClick={() => setInspectEvent(null)}
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-md p-1"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-3 flex items-center gap-2">
              <Code2 className="text-primary h-5 w-5" />
              <h3 className="text-lg font-semibold">Event Metadata</h3>
            </div>

            <div className="mb-4 space-y-2 text-xs">
              <div className="border-border/30 flex justify-between border-b py-1">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-mono font-medium">
                  {inspectEvent.action}
                </span>
              </div>
              <div className="border-border/30 flex justify-between border-b py-1">
                <span className="text-muted-foreground">Target:</span>
                <span className="font-mono">
                  {inspectEvent.targetType} ({inspectEvent.targetId || "N/A"})
                </span>
              </div>
              <div className="border-border/30 flex justify-between border-b py-1">
                <span className="text-muted-foreground">Actor:</span>
                <span className="font-medium">
                  {inspectEvent.actor?.email || inspectEvent.actorType}
                </span>
              </div>
              <div className="border-border/30 flex justify-between border-b py-1">
                <span className="text-muted-foreground">Timestamp:</span>
                <span>{new Date(inspectEvent.createdAt).toISOString()}</span>
              </div>
            </div>

            <div className="bg-muted/70 border-border/50 max-h-60 overflow-x-auto rounded-md border p-3">
              <pre className="text-foreground font-mono text-xs whitespace-pre-wrap">
                {JSON.stringify(inspectEvent.metadata, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => setInspectEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
