"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  NORMALIZED_STATUSES,
  type NormalizedResourceStatus,
  RESOURCE_KINDS,
  type ResourceFilterInput,
  type ResourceKind,
} from "../types";

interface ResourceFilterBarProps {
  filters: ResourceFilterInput;
  onChange: (filters: ResourceFilterInput) => void;
}

export function ResourceFilterBar({
  filters,
  onChange,
}: ResourceFilterBarProps) {
  const handleSearchChange = (val: string) => {
    onChange({ ...filters, search: val || undefined, cursor: undefined });
  };

  const handleProviderChange = (providerId?: string) => {
    onChange({ ...filters, providerId, cursor: undefined });
  };

  const handleKindChange = (kind?: ResourceKind) => {
    onChange({ ...filters, kind, cursor: undefined });
  };

  const handleStatusChange = (status?: NormalizedResourceStatus) => {
    onChange({ ...filters, status, cursor: undefined });
  };

  const handleStaleChange = (isStale?: boolean) => {
    onChange({ ...filters, isStale, cursor: undefined });
  };

  const handleClearFilters = () => {
    onChange({ pageSize: filters.pageSize || 20 });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.providerId ||
    filters.kind ||
    filters.status ||
    filters.isStale !== undefined,
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-stretch justify-between gap-2.5 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search resources by name or external ID..."
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Filter dropdowns/pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Select */}
          <select
            value={filters.providerId || ""}
            onChange={(e) =>
              handleProviderChange(e.target.value ? e.target.value : undefined)
            }
            className="border-input bg-background text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:ring-1 focus:outline-none"
          >
            <option value="">All Providers</option>
            <option value="neon">Neon</option>
            <option value="vercel">Vercel</option>
            <option value="render">Render</option>
          </select>

          {/* Kind Select */}
          <select
            value={filters.kind || ""}
            onChange={(e) =>
              handleKindChange(
                e.target.value ? (e.target.value as ResourceKind) : undefined,
              )
            }
            className="border-input bg-background text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:ring-1 focus:outline-none"
          >
            <option value="">All Kinds</option>
            {RESOURCE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={filters.status || ""}
            onChange={(e) =>
              handleStatusChange(
                e.target.value
                  ? (e.target.value as NormalizedResourceStatus)
                  : undefined,
              )
            }
            className="border-input bg-background text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:ring-1 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {NORMALIZED_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* Freshness Toggle */}
          <select
            value={
              filters.isStale === undefined
                ? ""
                : filters.isStale
                  ? "stale"
                  : "active"
            }
            onChange={(e) => {
              if (e.target.value === "stale") handleStaleChange(true);
              else if (e.target.value === "active") handleStaleChange(false);
              else handleStaleChange(undefined);
            }}
            className="border-input bg-background text-foreground focus:ring-ring h-9 rounded-md border px-2.5 text-xs focus:ring-1 focus:outline-none"
          >
            <option value="">All Freshness</option>
            <option value="active">Active Only</option>
            <option value="stale">Stale Only</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-foreground h-9 gap-1 text-xs"
            >
              <X className="size-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
