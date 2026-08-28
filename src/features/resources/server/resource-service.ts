import { and, desc, eq, ilike, lt, or, sql } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { providerConnections } from "@/db/schema/connections";
import {
  externalResources,
  resourceRelationships,
} from "@/db/schema/resources";
import { requirePermission } from "@/features/authorization/server/authorization-service";

import { decodeCursor, encodeCursor } from "./normalization";
import type {
  ExternalResourceDTO,
  PaginatedResourcesResponse,
  RelationshipType,
  ResourceDetailDTO,
  ResourceFilterInput,
  ResourceRelationshipDTO,
} from "../types";

function mapToResourceDTO(
  row: typeof externalResources.$inferSelect,
  connectionName?: string,
): ExternalResourceDTO {
  return {
    id: row.id,
    organizationId: row.organizationId,
    connectionId: row.connectionId,
    connectionName: connectionName || undefined,
    providerId: row.providerId,
    resourceKind: row.resourceKind as ExternalResourceDTO["resourceKind"],
    externalId: row.externalId,
    name: row.name,
    status: row.status,
    normalizedStatus:
      row.normalizedStatus as ExternalResourceDTO["normalizedStatus"],
    metadata: row.metadata,
    lastSeenAt: row.lastSeenAt.toISOString(),
    isStale: row.isStale,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Lists resources with opaque cursor pagination, multi-facet filtering, and search.
 */
export async function listResources(
  organizationId: string,
  actorUserId: string,
  filters: ResourceFilterInput = { pageSize: 20 },
  db: AppDb = getDb(),
): Promise<PaginatedResourcesResponse> {
  await requirePermission(organizationId, actorUserId, "resource:read", db);

  const pageSize = filters.pageSize || 20;
  const conditions = [eq(externalResources.organizationId, organizationId)];

  if (filters.providerId) {
    conditions.push(eq(externalResources.providerId, filters.providerId));
  }

  if (filters.connectionId) {
    conditions.push(eq(externalResources.connectionId, filters.connectionId));
  }

  if (filters.kind) {
    conditions.push(eq(externalResources.resourceKind, filters.kind));
  }

  if (filters.status) {
    conditions.push(eq(externalResources.normalizedStatus, filters.status));
  }

  if (filters.isStale !== undefined) {
    conditions.push(eq(externalResources.isStale, filters.isStale));
  }

  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(externalResources.name, term),
        ilike(externalResources.externalId, term),
      )!,
    );
  }

  // Cursor pagination decoding
  if (filters.cursor) {
    const decoded = decodeCursor(filters.cursor);
    if (decoded) {
      conditions.push(
        or(
          lt(externalResources.createdAt, decoded.createdAt),
          and(
            eq(externalResources.createdAt, decoded.createdAt),
            sql`${externalResources.id} > ${decoded.id}`,
          ),
        )!,
      );
    }
  }

  const rows = await db
    .select({
      res: externalResources,
      connName: providerConnections.name,
    })
    .from(externalResources)
    .innerJoin(
      providerConnections,
      eq(externalResources.connectionId, providerConnections.id),
    )
    .where(and(...conditions))
    .orderBy(desc(externalResources.createdAt), externalResources.id)
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const resultRows = hasMore ? rows.slice(0, pageSize) : rows;

  const data = resultRows.map((r) => mapToResourceDTO(r.res, r.connName));

  let nextCursor: string | null = null;
  if (hasMore && resultRows.length > 0) {
    const last = resultRows[resultRows.length - 1];
    nextCursor = encodeCursor(last!.res.createdAt, last!.res.id);
  }

  return {
    data,
    page: {
      nextCursor,
      hasMore,
    },
  };
}

/**
 * Gets a single resource by ID with incoming and outgoing relationship graph edges.
 */
export async function getResourceById(
  organizationId: string,
  resourceId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<ResourceDetailDTO | null> {
  await requirePermission(organizationId, actorUserId, "resource:read", db);

  const [row] = await db
    .select({
      res: externalResources,
      connName: providerConnections.name,
    })
    .from(externalResources)
    .innerJoin(
      providerConnections,
      eq(externalResources.connectionId, providerConnections.id),
    )
    .where(
      and(
        eq(externalResources.id, resourceId),
        eq(externalResources.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!row) return null;

  // Outgoing relationships (source = this resource)
  const outgoingRows = await db
    .select({
      rel: resourceRelationships,
      target: externalResources,
    })
    .from(resourceRelationships)
    .innerJoin(
      externalResources,
      eq(resourceRelationships.targetResourceId, externalResources.id),
    )
    .where(
      and(
        eq(resourceRelationships.organizationId, organizationId),
        eq(resourceRelationships.sourceResourceId, resourceId),
      ),
    );

  // Incoming relationships (target = this resource)
  const incomingRows = await db
    .select({
      rel: resourceRelationships,
      source: externalResources,
    })
    .from(resourceRelationships)
    .innerJoin(
      externalResources,
      eq(resourceRelationships.sourceResourceId, externalResources.id),
    )
    .where(
      and(
        eq(resourceRelationships.organizationId, organizationId),
        eq(resourceRelationships.targetResourceId, resourceId),
      ),
    );

  const outgoingRelationships: ResourceRelationshipDTO[] = outgoingRows.map(
    (r) => ({
      id: r.rel.id,
      organizationId: r.rel.organizationId,
      sourceResourceId: r.rel.sourceResourceId,
      targetResourceId: r.rel.targetResourceId,
      relationshipType: r.rel
        .relationshipType as ResourceRelationshipDTO["relationshipType"],
      confidence: r.rel.confidence,
      metadata: r.rel.metadata,
      createdAt: r.rel.createdAt.toISOString(),
      relatedResource: mapToResourceDTO(r.target),
    }),
  );

  const incomingRelationships: ResourceRelationshipDTO[] = incomingRows.map(
    (r) => ({
      id: r.rel.id,
      organizationId: r.rel.organizationId,
      sourceResourceId: r.rel.sourceResourceId,
      targetResourceId: r.rel.targetResourceId,
      relationshipType: r.rel
        .relationshipType as ResourceRelationshipDTO["relationshipType"],
      confidence: r.rel.confidence,
      metadata: r.rel.metadata,
      createdAt: r.rel.createdAt.toISOString(),
      relatedResource: mapToResourceDTO(r.source),
    }),
  );

  return {
    ...mapToResourceDTO(row.res, row.connName),
    outgoingRelationships,
    incomingRelationships,
  };
}

/**
 * Creates or updates a typed directed relationship between two resources.
 */
export async function createResourceRelationship(
  organizationId: string,
  sourceResourceId: string,
  targetResourceId: string,
  relationshipType: RelationshipType,
  metadata: Record<string, unknown> = {},
  db: AppDb = getDb(),
): Promise<ResourceRelationshipDTO> {
  const relId = crypto.randomUUID();

  const [created] = await db
    .insert(resourceRelationships)
    .values({
      id: relId,
      organizationId,
      sourceResourceId,
      targetResourceId,
      relationshipType,
      confidence: "observed",
      metadata,
    })
    .onConflictDoUpdate({
      target: [
        resourceRelationships.organizationId,
        resourceRelationships.sourceResourceId,
        resourceRelationships.targetResourceId,
        resourceRelationships.relationshipType,
      ],
      set: {
        confidence: "observed",
        metadata,
      },
    })
    .returning();

  return {
    id: created!.id,
    organizationId: created!.organizationId,
    sourceResourceId: created!.sourceResourceId,
    targetResourceId: created!.targetResourceId,
    relationshipType: created!
      .relationshipType as ResourceRelationshipDTO["relationshipType"],
    confidence: created!.confidence,
    metadata: created!.metadata,
    createdAt: created!.createdAt.toISOString(),
  };
}

/**
 * Infers and persists relationship edges for resources belonging to a connection.
 * - Neon: projects -> databases ('parent_of')
 * - Vercel: projects -> deployments ('parent_of')
 * - Render: services -> databases ('depends_on')
 */
export async function inferAndSyncRelationships(
  organizationId: string,
  connectionId: string,
  db: AppDb = getDb(),
): Promise<number> {
  const resources = await db
    .select()
    .from(externalResources)
    .where(
      and(
        eq(externalResources.organizationId, organizationId),
        eq(externalResources.connectionId, connectionId),
        eq(externalResources.isStale, false),
      ),
    );

  let inferredCount = 0;

  const projects = resources.filter((r) => r.resourceKind === "project");
  const databases = resources.filter((r) => r.resourceKind === "database");
  const deployments = resources.filter((r) => r.resourceKind === "deployment");
  const services = resources.filter((r) => r.resourceKind === "service");

  // 1. Neon project -> database relationship
  for (const proj of projects) {
    if (proj.providerId === "neon") {
      for (const dbRes of databases) {
        if (dbRes.providerId === "neon") {
          await createResourceRelationship(
            organizationId,
            proj.id,
            dbRes.id,
            "parent_of",
            { autoInferred: true },
            db,
          );
          inferredCount++;
        }
      }
    }
  }

  // 2. Vercel project -> deployment relationship
  for (const proj of projects) {
    if (proj.providerId === "vercel") {
      for (const dpl of deployments) {
        if (dpl.providerId === "vercel") {
          await createResourceRelationship(
            organizationId,
            proj.id,
            dpl.id,
            "parent_of",
            { autoInferred: true },
            db,
          );
          inferredCount++;
        }
      }
    }
  }

  // 3. Render service -> database relationship
  for (const srv of services) {
    if (srv.providerId === "render") {
      for (const dbRes of databases) {
        if (dbRes.providerId === "render") {
          await createResourceRelationship(
            organizationId,
            srv.id,
            dbRes.id,
            "depends_on",
            { autoInferred: true },
            db,
          );
          inferredCount++;
        }
      }
    }
  }

  return inferredCount;
}
