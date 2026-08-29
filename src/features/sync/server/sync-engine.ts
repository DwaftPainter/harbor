import { and, desc, eq, lt, sql } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import {
  connectionCredentials,
  providerConnections,
} from "@/db/schema/connections";
import { externalResources } from "@/db/schema/resources";
import { discoveredResources, syncRuns } from "@/db/schema/sync";
import { recordAuditEvent } from "@/features/audit/server/audit-service";
import { requirePermission } from "@/features/authorization/server/authorization-service";
import { decryptCredential } from "@/features/connections/server/encryption";
import type { ProviderId } from "@/features/connections/types";
import { normalizeResourceStatus } from "@/features/resources/server/normalization";
import { inferAndSyncRelationships } from "@/features/resources/server/resource-service";

import { discoverProviderResources } from "../providers/discovery-adapter";
import type {
  DiscoveredResourceDTO,
  QueueSyncInput,
  SyncRunDTO,
} from "../types";
import { acquireSyncLease, releaseSyncLease } from "./sync-lease";

function mapSyncRunToDTO(run: typeof syncRuns.$inferSelect): SyncRunDTO {
  const durationMs =
    run.startedAt && run.finishedAt
      ? run.finishedAt.getTime() - run.startedAt.getTime()
      : null;

  return {
    id: run.id,
    organizationId: run.organizationId,
    connectionId: run.connectionId,
    capability: run.capability as SyncRunDTO["capability"],
    trigger: run.trigger as SyncRunDTO["trigger"],
    triggeredById: run.triggeredById,
    status: run.status as SyncRunDTO["status"],
    leaseToken: run.leaseToken,
    leaseExpiresAt: run.leaseExpiresAt?.toISOString() ?? null,
    cursor: run.cursor,
    itemsObserved: run.itemsObserved,
    itemsCreated: run.itemsCreated,
    itemsUpdated: run.itemsUpdated,
    itemsStale: run.itemsStale,
    startedAt: run.startedAt?.toISOString() ?? null,
    finishedAt: run.finishedAt?.toISOString() ?? null,
    durationMs,
    errorSummary: run.errorSummary,
    errorCategory: (run.errorCategory as SyncRunDTO["errorCategory"]) || null,
    retryCount: run.retryCount,
    nextRetryAt: run.nextRetryAt?.toISOString() ?? null,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString(),
  };
}

function mapResourceToDTO(
  res: typeof discoveredResources.$inferSelect,
): DiscoveredResourceDTO {
  return {
    id: res.id,
    organizationId: res.organizationId,
    connectionId: res.connectionId,
    providerId: res.providerId,
    resourceKind: res.resourceKind as DiscoveredResourceDTO["resourceKind"],
    externalId: res.externalId,
    name: res.name,
    status: res.status,
    metadata: res.metadata,
    lastSeenAt: res.lastSeenAt.toISOString(),
    isStale: res.isStale,
    createdAt: res.createdAt.toISOString(),
    updatedAt: res.updatedAt.toISOString(),
  };
}

/**
 * Queues a sync operation for a connection.
 */
export async function queueSyncRun(
  organizationId: string,
  connectionId: string,
  actorUserId: string,
  options?: Partial<QueueSyncInput>,
  db: AppDb = getDb(),
): Promise<SyncRunDTO> {
  await requirePermission(organizationId, actorUserId, "connection:sync", db);

  const [conn] = await db
    .select()
    .from(providerConnections)
    .where(
      and(
        eq(providerConnections.id, connectionId),
        eq(providerConnections.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!conn) {
    throw new Error("Connection not found in active organization");
  }

  if (conn.status === "revoked" || conn.status === "disabled") {
    throw new Error(`Cannot synchronize a ${conn.status} connection`);
  }

  const runId = crypto.randomUUID();
  const capability = options?.capability || "full";
  const trigger = options?.trigger || "manual";

  const [createdRun] = await db
    .insert(syncRuns)
    .values({
      id: runId,
      organizationId,
      connectionId,
      capability,
      trigger,
      triggeredById: actorUserId,
      status: "queued",
    })
    .returning();

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "sync.triggered",
      targetType: "connection",
      targetId: connectionId,
      outcome: "success",
      metadata: {
        syncRunId: runId,
        capability,
        trigger,
      },
    },
    db,
  );

  return mapSyncRunToDTO(createdRun!);
}

/**
 * Executes a sync run with exclusive lease acquisition, cursor pagination,
 * idempotent upsert, and stale-resource reconciliation.
 */
export async function executeSyncRun(
  syncRunId: string,
  db: AppDb = getDb(),
): Promise<SyncRunDTO> {
  const [run] = await db
    .select()
    .from(syncRuns)
    .where(eq(syncRuns.id, syncRunId))
    .limit(1);

  if (!run) {
    throw new Error(`Sync run '${syncRunId}' not found`);
  }

  if (run.status === "cancelled" || run.status === "succeeded") {
    return mapSyncRunToDTO(run);
  }

  // 1. Acquire exclusive lease for this (connection, capability) partition
  const lease = await acquireSyncLease(
    run.connectionId,
    run.capability,
    run.id,
    30000,
    db,
  );

  if (!lease.acquired) {
    // Cannot acquire lease right now - keep queued
    return mapSyncRunToDTO(run);
  }

  const syncStartTime = new Date();

  try {
    // 2. Fetch connection and decrypt credentials
    const [connRow] = await db
      .select({
        conn: providerConnections,
        cred: connectionCredentials,
      })
      .from(providerConnections)
      .innerJoin(
        connectionCredentials,
        eq(providerConnections.id, connectionCredentials.connectionId),
      )
      .where(eq(providerConnections.id, run.connectionId))
      .limit(1);

    if (!connRow) {
      throw new Error("Connection or credentials not found for sync execution");
    }

    const credentials = decryptCredential({
      encryptedData: connRow.cred.encryptedData,
      iv: connRow.cred.iv,
      authTag: connRow.cred.authTag,
      keyVersion: connRow.cred.keyVersion,
    });

    // 3. Discover provider resources
    const pageResult = await discoverProviderResources(
      connRow.conn.providerId as ProviderId,
      credentials,
      run.cursor || undefined,
    );

    let observedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    // 4. Idempotently upsert discovered resources & external resources
    for (const item of pageResult.items) {
      observedCount++;
      const resourceId = crypto.randomUUID();
      const normalizedStatus = normalizeResourceStatus(
        connRow.conn.providerId,
        item.status,
      );

      const upsertResult = await db
        .insert(discoveredResources)
        .values({
          id: resourceId,
          organizationId: run.organizationId,
          connectionId: run.connectionId,
          providerId: connRow.conn.providerId,
          resourceKind: item.kind,
          externalId: item.externalId,
          name: item.name,
          status: item.status || "active",
          metadata: item.metadata || {},
          lastSeenAt: new Date(),
          isStale: false,
        })
        .onConflictDoUpdate({
          target: [
            discoveredResources.connectionId,
            discoveredResources.resourceKind,
            discoveredResources.externalId,
          ],
          set: {
            name: item.name,
            status: item.status || "active",
            metadata: item.metadata || {},
            lastSeenAt: new Date(),
            isStale: false,
            updatedAt: new Date(),
          },
        })
        .returning({ id: discoveredResources.id });

      await db
        .insert(externalResources)
        .values({
          id: resourceId,
          organizationId: run.organizationId,
          connectionId: run.connectionId,
          providerId: connRow.conn.providerId,
          resourceKind: item.kind,
          externalId: item.externalId,
          name: item.name,
          status: item.status || "active",
          normalizedStatus,
          metadata: item.metadata || {},
          lastSeenAt: new Date(),
          isStale: false,
        })
        .onConflictDoUpdate({
          target: [
            externalResources.connectionId,
            externalResources.resourceKind,
            externalResources.externalId,
          ],
          set: {
            name: item.name,
            status: item.status || "active",
            normalizedStatus,
            metadata: item.metadata || {},
            lastSeenAt: new Date(),
            isStale: false,
            updatedAt: new Date(),
          },
        });

      if (upsertResult[0]?.id === resourceId) {
        createdCount++;
      } else {
        updatedCount++;
      }
    }

    // 5. Stale resource detection upon full successful sync
    let staleCount = 0;
    if (run.capability === "full" && !pageResult.hasMore) {
      const staleRows = await db
        .update(discoveredResources)
        .set({
          isStale: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(discoveredResources.connectionId, run.connectionId),
            lt(discoveredResources.lastSeenAt, syncStartTime),
            eq(discoveredResources.isStale, false),
          ),
        )
        .returning({ id: discoveredResources.id });

      await db
        .update(externalResources)
        .set({
          isStale: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(externalResources.connectionId, run.connectionId),
            lt(externalResources.lastSeenAt, syncStartTime),
            eq(externalResources.isStale, false),
          ),
        );

      staleCount = staleRows.length;
    }

    // Automatically infer relationships between discovered resources
    await inferAndSyncRelationships(run.organizationId, run.connectionId, db);

    const finishedAt = new Date();
    const status = pageResult.hasMore ? "partially_succeeded" : "succeeded";

    // 6. Update Sync Run Record
    const [updatedRun] = await db
      .update(syncRuns)
      .set({
        status,
        leaseToken: null,
        leaseExpiresAt: null,
        itemsObserved: sql`${syncRuns.itemsObserved} + ${observedCount}`,
        itemsCreated: sql`${syncRuns.itemsCreated} + ${createdCount}`,
        itemsUpdated: sql`${syncRuns.itemsUpdated} + ${updatedCount}`,
        itemsStale: staleCount,
        cursor: pageResult.nextCursor || null,
        finishedAt,
        updatedAt: finishedAt,
      })
      .where(eq(syncRuns.id, run.id))
      .returning();

    // 7. Update Connection lastSyncAt
    await db
      .update(providerConnections)
      .set({
        lastSyncAt: finishedAt,
        status: "connected",
        updatedAt: finishedAt,
      })
      .where(eq(providerConnections.id, run.connectionId));

    // 8. Record audit event
    await recordAuditEvent(
      {
        organizationId: run.organizationId,
        actorId: run.triggeredById || "system",
        actorType: run.triggeredById ? "user" : "system",
        action: "sync.completed",
        targetType: "connection",
        targetId: run.connectionId,
        outcome: "success",
        metadata: {
          syncRunId: run.id,
          status,
          itemsObserved: observedCount,
          itemsStale: staleCount,
        },
      },
      db,
    );

    return mapSyncRunToDTO(updatedRun!);
  } catch (err) {
    const errorSummary =
      err instanceof Error ? err.message : "Sync execution failed";

    const [failedRun] = await db
      .update(syncRuns)
      .set({
        status: "failed",
        leaseToken: null,
        leaseExpiresAt: null,
        errorSummary,
        errorCategory: "transient",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(syncRuns.id, run.id))
      .returning();

    await recordAuditEvent(
      {
        organizationId: run.organizationId,
        actorId: run.triggeredById || "system",
        actorType: run.triggeredById ? "user" : "system",
        action: "sync.completed",
        targetType: "connection",
        targetId: run.connectionId,
        outcome: "error",
        metadata: {
          syncRunId: run.id,
          status: "failed",
          errorSummary,
        },
      },
      db,
    );

    return mapSyncRunToDTO(failedRun!);
  } finally {
    // 9. Always release lease lock
    await releaseSyncLease(run.id, lease.leaseToken, db);
  }
}

/**
 * Cancels a queued or running sync run.
 */
export async function cancelSyncRun(
  organizationId: string,
  syncRunId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<SyncRunDTO> {
  await requirePermission(organizationId, actorUserId, "connection:sync", db);

  const [run] = await db
    .select()
    .from(syncRuns)
    .where(
      and(
        eq(syncRuns.id, syncRunId),
        eq(syncRuns.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!run) {
    throw new Error("Sync run not found");
  }

  if (run.status === "succeeded" || run.status === "failed") {
    throw new Error(`Cannot cancel a ${run.status} sync run`);
  }

  const [cancelledRun] = await db
    .update(syncRuns)
    .set({
      status: "cancelled",
      finishedAt: new Date(),
      leaseToken: null,
      leaseExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(syncRuns.id, syncRunId))
    .returning();

  await recordAuditEvent(
    {
      organizationId,
      actorId: actorUserId,
      actorType: "user",
      action: "sync.cancelled",
      targetType: "connection",
      targetId: run.connectionId,
      outcome: "success",
      metadata: {
        syncRunId,
      },
    },
    db,
  );

  return mapSyncRunToDTO(cancelledRun!);
}

/**
 * Lists recent sync runs for a connection.
 */
export async function listSyncRuns(
  organizationId: string,
  connectionId: string,
  actorUserId: string,
  limit = 20,
  db: AppDb = getDb(),
): Promise<SyncRunDTO[]> {
  await requirePermission(organizationId, actorUserId, "connection:read", db);

  const rows = await db
    .select()
    .from(syncRuns)
    .where(
      and(
        eq(syncRuns.organizationId, organizationId),
        eq(syncRuns.connectionId, connectionId),
      ),
    )
    .orderBy(desc(syncRuns.createdAt))
    .limit(limit);

  return rows.map(mapSyncRunToDTO);
}

/**
 * Gets a single sync run by ID.
 */
export async function getSyncRunById(
  organizationId: string,
  syncRunId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<SyncRunDTO | null> {
  await requirePermission(organizationId, actorUserId, "connection:read", db);

  const [run] = await db
    .select()
    .from(syncRuns)
    .where(
      and(
        eq(syncRuns.id, syncRunId),
        eq(syncRuns.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!run) return null;
  return mapSyncRunToDTO(run);
}

/**
 * Lists discovered resources for a connection.
 */
export async function listDiscoveredResources(
  organizationId: string,
  connectionId: string,
  actorUserId: string,
  db: AppDb = getDb(),
): Promise<DiscoveredResourceDTO[]> {
  await requirePermission(organizationId, actorUserId, "connection:read", db);

  const rows = await db
    .select()
    .from(discoveredResources)
    .where(
      and(
        eq(discoveredResources.organizationId, organizationId),
        eq(discoveredResources.connectionId, connectionId),
      ),
    )
    .orderBy(discoveredResources.resourceKind, discoveredResources.name);

  return rows.map(mapResourceToDTO);
}
