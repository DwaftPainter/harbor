import { z } from "zod";

export const SYNC_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "partially_succeeded",
  "failed",
  "cancelled",
] as const;

export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const SYNC_TRIGGERS = ["manual", "scheduled", "webhook"] as const;
export type SyncTrigger = (typeof SYNC_TRIGGERS)[number];

export const SYNC_CAPABILITIES = [
  "full",
  "projects",
  "deployments",
  "databases",
  "services",
] as const;
export type SyncCapability = (typeof SYNC_CAPABILITIES)[number];

export const ERROR_CATEGORIES = [
  "auth",
  "rate_limit",
  "timeout",
  "schema",
  "transient",
  "fatal",
] as const;
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

export const RESOURCE_KINDS = [
  "project",
  "database",
  "service",
  "deployment",
] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export interface DiscoveredResourceItem {
  externalId: string;
  name: string;
  kind: ResourceKind;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface SyncPageResult {
  items: DiscoveredResourceItem[];
  nextCursor?: string;
  hasMore: boolean;
  rateLimitResetSeconds?: number;
}

export const queueSyncSchema = z.object({
  capability: z.enum(SYNC_CAPABILITIES).default("full"),
  trigger: z.enum(SYNC_TRIGGERS).default("manual"),
});

export type QueueSyncInput = z.infer<typeof queueSyncSchema>;

export interface SyncRunDTO {
  id: string;
  organizationId: string;
  connectionId: string;
  capability: SyncCapability;
  trigger: SyncTrigger;
  triggeredById: string | null;
  status: SyncStatus;
  leaseToken: string | null;
  leaseExpiresAt: string | null;
  cursor: string | null;
  itemsObserved: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsStale: number;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs?: number | null;
  errorSummary: string | null;
  errorCategory: ErrorCategory | null;
  retryCount: number;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveredResourceDTO {
  id: string;
  organizationId: string;
  connectionId: string;
  providerId: string;
  resourceKind: ResourceKind;
  externalId: string;
  name: string;
  status: string | null;
  metadata: Record<string, unknown> | null;
  lastSeenAt: string;
  isStale: boolean;
  createdAt: string;
  updatedAt: string;
}
