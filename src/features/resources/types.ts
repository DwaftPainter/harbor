import { z } from "zod";

export const RESOURCE_KINDS = [
  "project",
  "database",
  "service",
  "deployment",
  "storage",
  "domain",
] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const NORMALIZED_STATUSES = [
  "running",
  "stopped",
  "provisioning",
  "degraded",
  "error",
  "unknown",
] as const;

export type NormalizedResourceStatus = (typeof NORMALIZED_STATUSES)[number];

export const RELATIONSHIP_TYPES = [
  "parent_of",
  "depends_on",
  "deploys_to",
  "links_to",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export const resourceFilterSchema = z.object({
  providerId: z.string().optional(),
  connectionId: z.string().optional(),
  kind: z.enum(RESOURCE_KINDS).optional(),
  status: z.enum(NORMALIZED_STATUSES).optional(),
  isStale: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  search: z.string().max(100).optional(),
  cursor: z.string().max(256).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export interface ResourceFilterInput {
  providerId?: string;
  connectionId?: string;
  kind?: ResourceKind;
  status?: NormalizedResourceStatus;
  isStale?: boolean;
  search?: string;
  cursor?: string;
  pageSize?: number;
}

export interface ExternalResourceDTO {
  id: string;
  organizationId: string;
  connectionId: string;
  connectionName?: string;
  providerId: string;
  resourceKind: ResourceKind;
  externalId: string;
  name: string;
  status: string | null;
  normalizedStatus: NormalizedResourceStatus;
  metadata: Record<string, unknown> | null;
  lastSeenAt: string;
  isStale: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceRelationshipDTO {
  id: string;
  organizationId: string;
  sourceResourceId: string;
  targetResourceId: string;
  relationshipType: RelationshipType;
  confidence: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  relatedResource?: ExternalResourceDTO;
}

export interface ResourceDetailDTO extends ExternalResourceDTO {
  outgoingRelationships: ResourceRelationshipDTO[];
  incomingRelationships: ResourceRelationshipDTO[];
}

export interface PaginatedResourcesResponse {
  data: ExternalResourceDTO[];
  page: {
    nextCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
  };
}
