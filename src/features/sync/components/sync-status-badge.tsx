"use client";

import { AlertCircle, Ban, CheckCircle2, Clock, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { SyncStatus } from "../types";

interface SyncStatusBadgeProps {
  status: SyncStatus;
}

export function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
  switch (status) {
    case "queued":
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-muted-foreground/20 gap-1"
        >
          <Clock className="size-3" /> Queued
        </Badge>
      );
    case "running":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-sky-500/20 bg-sky-500/10 text-sky-500"
        >
          <Loader2 className="size-3 animate-spin" /> Running
        </Badge>
      );
    case "succeeded":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
        >
          <CheckCircle2 className="size-3" /> Succeeded
        </Badge>
      );
    case "partially_succeeded":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-500"
        >
          <AlertCircle className="size-3" /> Partial
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20 gap-1"
        >
          <AlertCircle className="size-3" /> Failed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-muted-foreground/20 gap-1"
        >
          <Ban className="size-3" /> Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
