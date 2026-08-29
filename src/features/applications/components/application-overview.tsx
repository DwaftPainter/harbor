"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  Database,
  Globe,
  HardDrive,
  Layers,
  Network,
  Server,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceStatusBadge } from "@/features/resources/components/resource-status-badge";
import type { ResourceKind } from "@/features/resources/types";

import type {
  ApplicationDetailDTO,
  BindingSuggestionDTO,
  EnvironmentDTO,
  ResourceBindingDTO,
} from "../types";
import { BindingSuggestionsCard } from "./binding-suggestions-card";
import { BindResourceDialog } from "./bind-resource-dialog";
import { EnvironmentManagerDialog } from "./environment-manager-dialog";

interface ApplicationOverviewProps {
  organizationId: string;
  applicationId: string;
}

export function ApplicationOverview({
  organizationId,
  applicationId,
}: ApplicationOverviewProps) {
  const router = useRouter();
  const [app, setApp] = useState<ApplicationDetailDTO | null>(null);
  const [environments, setEnvironments] = useState<EnvironmentDTO[]>([]);
  const [activeEnvId, setActiveEnvId] = useState<string>("");
  const [bindings, setBindings] = useState<ResourceBindingDTO[]>([]);
  const [suggestions, setSuggestions] = useState<BindingSuggestionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [appRes, envsRes, bindingsRes, suggRes] = await Promise.all([
          fetch(
            `/api/organizations/${organizationId}/applications/${applicationId}`,
          ),
          fetch(
            `/api/organizations/${organizationId}/applications/${applicationId}/environments`,
          ),
          fetch(
            `/api/organizations/${organizationId}/applications/${applicationId}/bindings`,
          ),
          fetch(
            `/api/organizations/${organizationId}/applications/${applicationId}/suggestions`,
          ),
        ]);

        if (!ignore) {
          const appJson = await appRes.json();
          const envsJson = await envsRes.json();
          const bindingsJson = await bindingsRes.json();
          const suggJson = await suggRes.json();

          if (appRes.ok && envsRes.ok) {
            setApp(appJson.data);
            const envList: EnvironmentDTO[] = envsJson.data || [];
            setEnvironments(envList);
            if (envList.length > 0 && !activeEnvId) {
              setActiveEnvId(envList[0]?.id || "");
            }
            setBindings(bindingsJson.data || []);
            setSuggestions(suggJson.data || []);
          } else {
            setError(
              appJson.error || envsJson.error || "Failed to load application",
            );
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

    loadData();

    return () => {
      ignore = true;
    };
  }, [organizationId, applicationId, activeEnvId]);

  const handleUnbind = async (bindingId: string) => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/applications/${applicationId}/bindings/${bindingId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setBindings((prev) => prev.filter((b) => b.id !== bindingId));
      }
    } catch {
      // Ignored for optimistic UI
    }
  };

  const handleArchiveApp = async () => {
    if (!confirm("Are you sure you want to archive this application?")) return;
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/applications/${applicationId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        router.push("/applications");
      }
    } catch {
      // Ignored
    }
  };

  const getKindIcon = (kind?: ResourceKind) => {
    switch (kind) {
      case "database":
        return <Database className="size-3.5 text-emerald-500" />;
      case "project":
        return <Boxes className="size-3.5 text-sky-500" />;
      case "service":
        return <Server className="size-3.5 text-purple-500" />;
      case "deployment":
        return <Globe className="size-3.5 text-amber-500" />;
      case "storage":
        return <HardDrive className="size-3.5 text-rose-500" />;
      case "domain":
        return <Network className="size-3.5 text-indigo-500" />;
      default:
        return <Boxes className="text-primary size-3.5" />;
    }
  };

  const currentEnvBindings = bindings.filter(
    (b) => b.environmentId === activeEnvId,
  );

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-10 w-96 rounded-md" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="space-y-4">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" /> Back to Applications
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Application not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/applications">
              <Button variant="ghost" size="icon" className="size-7">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <h2 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
              {app.name}
              {app.isArchived && (
                <Badge
                  variant="outline"
                  className="border-amber-500/20 text-xs text-amber-500"
                >
                  Archived
                </Badge>
              )}
            </h2>
            <span className="text-muted-foreground font-mono text-xs">
              /{app.slug}
            </span>
          </div>
          {app.description && (
            <p className="text-muted-foreground pl-9 text-xs">
              {app.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <EnvironmentManagerDialog
            organizationId={organizationId}
            applicationId={applicationId}
            environments={environments}
            onEnvironmentCreated={(newEnv) => {
              setEnvironments((prev) => [...prev, newEnv]);
              if (!activeEnvId) setActiveEnvId(newEnv.id);
            }}
            onEnvironmentArchived={(envId) => {
              setEnvironments((prev) => prev.filter((e) => e.id !== envId));
              if (activeEnvId === envId) {
                const remaining = environments.filter((e) => e.id !== envId);
                setActiveEnvId(remaining[0]?.id || "");
              }
            }}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchiveApp}
            className="text-muted-foreground hover:text-destructive h-8 gap-1 text-xs"
          >
            <Trash2 className="size-3.5" /> Archive
          </Button>
        </div>
      </div>

      {/* Binding Suggestions Banner */}
      <BindingSuggestionsCard
        organizationId={organizationId}
        applicationId={applicationId}
        suggestions={suggestions}
        environments={environments}
        onAccepted={(newBinding) => {
          setBindings((prev) => [...prev, newBinding]);
          setSuggestions((prev) =>
            prev.filter((s) => s.resourceId !== newBinding.resourceId),
          );
        }}
        onDismissed={(resId) => {
          setSuggestions((prev) => prev.filter((s) => s.resourceId !== resId));
        }}
      />

      {/* Environment Tabs & Resource Workbench */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 border-b pb-2">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {environments.map((env) => {
              const count = bindings.filter(
                (b) => b.environmentId === env.id,
              ).length;
              const isActive = activeEnvId === env.id;
              return (
                <button
                  key={env.id}
                  onClick={() => setActiveEnvId(env.id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Layers className="size-3.5" />
                  <span>{env.name}</span>
                  {env.isProduction && (
                    <span className="rounded bg-emerald-500/20 px-1 py-0 text-[10px] font-normal text-emerald-300">
                      Prod
                    </span>
                  )}
                  <span className="text-[11px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Action to bind resource */}
          {environments.length > 0 && (
            <BindResourceDialog
              organizationId={organizationId}
              applicationId={applicationId}
              environments={environments}
              selectedEnvironmentId={activeEnvId}
              onBound={(newBinding) => {
                setBindings((prev) => [...prev, newBinding]);
              }}
            />
          )}
        </div>

        {/* Bound Resources Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground border-b font-medium">
                    <th className="px-4 py-3">Bound Resource</th>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Provenance</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentEnvBindings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-muted-foreground p-12 text-center"
                      >
                        No resources currently bound to this environment. Click
                        &quot;Bind Resource&quot; to attach synchronized cloud
                        infrastructure.
                      </td>
                    </tr>
                  ) : (
                    currentEnvBindings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-muted rounded-md p-1.5">
                              {getKindIcon(b.resource?.resourceKind)}
                            </div>
                            <div>
                              <div className="text-foreground flex items-center gap-1.5 font-semibold">
                                {b.resource?.name || b.resourceId}
                                {b.isPrimary && (
                                  <Badge
                                    variant="outline"
                                    className="gap-0.5 border-amber-500/20 bg-amber-500/10 px-1 py-0 text-[10px] text-amber-500"
                                  >
                                    <Star className="size-2.5 fill-amber-500" />{" "}
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="text-muted-foreground font-mono text-[11px]">
                                {b.resource?.externalId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="capitalize">
                            {b.resource?.resourceKind || "resource"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium capitalize">
                          {b.resource?.providerId}
                        </td>
                        <td className="px-4 py-3">
                          {b.resource?.normalizedStatus ? (
                            <ResourceStatusBadge
                              status={b.resource.normalizedStatus}
                            />
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground font-mono text-[11px] capitalize">
                            {b.bindingSource}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnbind(b.id)}
                            className="text-muted-foreground hover:text-destructive h-7 text-xs"
                          >
                            Unbind
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
      </div>
    </div>
  );
}
