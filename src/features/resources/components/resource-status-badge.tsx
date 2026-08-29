"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  StopCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { NormalizedResourceStatus } from "../types";

interface ResourceStatusBadgeProps {
  status: NormalizedResourceStatus;
}

export function ResourceStatusBadge({ status }: ResourceStatusBadgeProps) {
  switch (status) {
    case "running":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-xs font-medium text-emerald-500"
        >
          <CheckCircle2 className="size-3" /> Running
        </Badge>
      );
    case "provisioning":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-sky-500/20 bg-sky-500/10 text-xs font-medium text-sky-500"
        >
          <Loader2 className="size-3 animate-spin" /> Provisioning
        </Badge>
      );
    case "stopped":
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-muted-foreground/20 gap-1 text-xs font-medium"
        >
          <StopCircle className="size-3" /> Stopped
        </Badge>
      );
    case "degraded":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/20 bg-amber-500/10 text-xs font-medium text-amber-500"
        >
          <AlertTriangle className="size-3" /> Degraded
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-xs font-medium"
        >
          <AlertCircle className="size-3" /> Error
        </Badge>
      );
    case "unknown":
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-muted-foreground/20 gap-1 text-xs font-medium"
        >
          <HelpCircle className="size-3" /> Unknown
        </Badge>
      );
  }
}
