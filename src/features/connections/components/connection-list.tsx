"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Globe,
  Key,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/features/authorization/hooks/use-permissions";

import { DiscoveredResourcesDialog } from "@/features/sync/components/discovered-resources-dialog";
import { SyncHistoryDialog } from "@/features/sync/components/sync-history-dialog";

import type {
  ConnectionStatus,
  ProviderConnectionDTO,
  ProviderId,
} from "../types";
import { ConnectProviderDialog } from "./connect-provider-dialog";
import { RotateCredentialsDialog } from "./rotate-credentials-dialog";

interface ConnectionListProps {
  organizationId: string;
  role?: string;
}

export function ConnectionList({ organizationId, role }: ConnectionListProps) {
  const [connections, setConnections] = useState<ProviderConnectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const permissions = usePermissions(role);
  const canCreate = permissions.canCreateConnections;
  const canUpdate = permissions.canUpdateConnections;
  const canDelete = permissions.canDeleteConnections;

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/connections`,
      );
      const json = await res.json();
      if (res.ok) {
        setConnections(json.data || []);
      } else {
        setActionError(json.error || "Failed to load provider connections");
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Error loading connections",
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/organizations/${organizationId}/connections`,
        );
        const json = await res.json();
        if (!ignore && res.ok) {
          setConnections(json.data || []);
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
  }, [organizationId]);

  const handleTestConnection = async (connectionId: string) => {
    setTestingId(connectionId);
    setActionError(null);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/connections/${connectionId}/validate`,
        { method: "POST" },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Validation failed");
      }
      await fetchConnections();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Validation test failed",
      );
    } finally {
      setTestingId(null);
    }
  };

  const handleRevokeConnection = async (connectionId: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke and delete '${name}'? Background synchronization will be stopped immediately.`,
      )
    ) {
      return;
    }

    setRevokingId(connectionId);
    setActionError(null);
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/connections/${connectionId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to revoke connection");
      }
      await fetchConnections();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Revocation failed");
    } finally {
      setRevokingId(null);
    }
  };

  const getProviderIcon = (id: ProviderId) => {
    switch (id) {
      case "neon":
      case "supabase":
        return <Database className="size-5 text-emerald-500" />;
      case "vercel":
        return <Globe className="size-5 text-sky-500" />;
      case "render":
      case "railway":
        return <Server className="size-5 text-purple-500" />;
      case "cloudflare":
        return <Shield className="size-5 text-amber-500" />;
      default:
        return <Server className="text-primary size-5" />;
    }
  };

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case "connected":
        return (
          <Badge
            variant="outline"
            className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
          >
            <CheckCircle2 className="size-3.5" /> Connected
          </Badge>
        );
      case "validating":
        return (
          <Badge
            variant="outline"
            className="gap-1.5 border-sky-500/20 bg-sky-500/10 text-sky-500"
          >
            <Loader2 className="size-3.5 animate-spin" /> Validating
          </Badge>
        );
      case "degraded":
        return (
          <Badge
            variant="outline"
            className="gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-500"
          >
            <AlertCircle className="size-3.5" /> Degraded
          </Badge>
        );
      case "revoked":
      case "disabled":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5"
          >
            <AlertCircle className="size-3.5" /> Revoked
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Cloud Provider Connections
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage authenticated connections used to discover, synchronize, and
            monitor external infrastructure.
          </p>
        </div>
        {canCreate && (
          <ConnectProviderDialog
            organizationId={organizationId}
            onSuccess={fetchConnections}
          />
        )}
      </div>

      {actionError && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center justify-between rounded-lg border p-3 text-sm">
          <span>{actionError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionError(null)}
            className="text-destructive hover:bg-destructive/20 h-7 px-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : connections.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-xl">
              <Server className="size-6" />
            </div>
            <CardTitle>No Provider Connections</CardTitle>
            <CardDescription>
              Connect your Neon, Vercel, or Render accounts to begin discovering
              and managing applications.
            </CardDescription>
          </CardHeader>
          {canCreate && (
            <CardContent className="flex justify-center pb-6">
              <ConnectProviderDialog
                organizationId={organizationId}
                onSuccess={fetchConnections}
              />
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {connections.map((conn) => {
            const isTesting = testingId === conn.id;
            const isRevoking = revokingId === conn.id;

            return (
              <Card
                key={conn.id}
                className="relative flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                        {getProviderIcon(conn.providerId)}
                      </div>
                      <div>
                        <CardTitle className="text-base leading-tight font-semibold">
                          {conn.name}
                        </CardTitle>
                        <CardDescription className="text-xs capitalize">
                          {conn.providerId} Provider
                        </CardDescription>
                      </div>
                    </div>
                    <div>{getStatusBadge(conn.status)}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  {conn.externalAccountName && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Account</span>
                      <span className="text-foreground font-medium">
                        {conn.externalAccountName}
                      </span>
                    </div>
                  )}

                  {conn.fingerprint && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">
                        Key Fingerprint
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {conn.fingerprint}...
                      </span>
                    </div>
                  )}

                  {conn.lastValidatedAt && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">
                        Last Validated
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(conn.lastValidatedAt).toLocaleString(
                          undefined,
                          {
                            dateStyle: "short",
                            timeStyle: "short",
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {conn.lastSyncAt && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">
                        Last Synchronized
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(conn.lastSyncAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  )}

                  {conn.errorSummary && (
                    <div className="bg-destructive/10 text-destructive rounded p-2">
                      <span className="font-medium">Error:</span>{" "}
                      {conn.errorSummary}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <DiscoveredResourcesDialog
                      organizationId={organizationId}
                      connectionId={conn.id}
                      connectionName={conn.name}
                    />

                    <SyncHistoryDialog
                      organizationId={organizationId}
                      connectionId={conn.id}
                      connectionName={conn.name}
                      canSync={canUpdate}
                      onSyncComplete={fetchConnections}
                    />

                    {canUpdate && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(conn.id)}
                          disabled={isTesting || isRevoking}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <RefreshCw
                            className={`size-3.5 ${
                              isTesting ? "animate-spin" : ""
                            }`}
                          />
                          Test
                        </Button>

                        <RotateCredentialsDialog
                          organizationId={organizationId}
                          connection={conn}
                          onSuccess={fetchConnections}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isTesting || isRevoking}
                              className="h-8 gap-1.5 text-xs"
                            >
                              <Key className="size-3.5" />
                              Rotate
                            </Button>
                          }
                        />
                      </>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRevokeConnection(conn.id, conn.name)
                        }
                        disabled={isTesting || isRevoking}
                        className="text-destructive hover:bg-destructive/10 h-8 gap-1.5 text-xs"
                      >
                        {isRevoking ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        Revoke
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
