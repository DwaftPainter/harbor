"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Layers,
  Link2,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import type { ApplicationDetailDTO } from "../types";
import { CreateApplicationDialog } from "./create-application-dialog";

interface ApplicationListProps {
  organizationId: string;
}

export function ApplicationList({ organizationId }: ApplicationListProps) {
  const [apps, setApps] = useState<ApplicationDetailDTO[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(
          `/api/organizations/${organizationId}/applications?${params.toString()}`,
        );
        if (!ignore) {
          const json = await res.json();
          if (res.ok) {
            setApps(json.data || []);
          } else {
            setError(json.error || "Failed to load applications");
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
  }, [organizationId, search]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(
        `/api/organizations/${organizationId}/applications?${params.toString()}`,
      );
      const json = await res.json();
      if (res.ok) {
        setApps(json.data || []);
      } else {
        setError(json.error || "Failed to refresh applications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications by name..."
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <CreateApplicationDialog
            organizationId={organizationId}
            onCreated={(newApp) => {
              setApps((prev) => [newApp, ...prev]);
            }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Grid of Applications */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="text-muted-foreground space-y-3 rounded-lg border border-dashed p-12 text-center text-sm">
          <Boxes className="text-muted-foreground/50 mx-auto size-10" />
          <div>
            <p className="text-foreground font-semibold">
              No applications found
            </p>
            <p className="text-muted-foreground text-xs">
              Create your first application to group and manage cloud resources.
            </p>
          </div>
          <div className="pt-2">
            <CreateApplicationDialog
              organizationId={organizationId}
              onCreated={(newApp) => {
                setApps((prev) => [newApp, ...prev]);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="group block"
            >
              <Card className="hover:border-primary/50 h-full transition-all duration-150 hover:shadow-md">
                <CardHeader className="space-y-1 p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-foreground group-hover:text-primary flex items-center gap-1.5 text-sm font-semibold transition-colors">
                      {app.name}
                      <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </CardTitle>
                    {app.isArchived && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/20 px-1 py-0 text-[10px] text-amber-500"
                      >
                        Archived
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    /{app.slug}
                  </p>
                </CardHeader>

                <CardContent className="space-y-3 p-4 pt-1">
                  {app.description && (
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {app.description}
                    </p>
                  )}

                  {/* Environments list */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <Layers className="size-3" /> Environments (
                      {app.environments.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {app.environments.map((env) => (
                        <Badge
                          key={env.id}
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px] capitalize"
                        >
                          {env.name}
                          {env.isProduction && " 🌟"}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats footer */}
                  <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Link2 className="size-3" />
                      <span>{app.boundResourceCount} bound resources</span>
                    </div>
                    <span className="text-[10px]">
                      Created {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
