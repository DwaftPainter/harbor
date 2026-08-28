import { and, eq, gt } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { syncRuns } from "@/db/schema/sync";

export interface AcquireLeaseResult {
  acquired: boolean;
  leaseToken?: string;
  expiresAt?: Date;
  activeRunId?: string;
  error?: string;
}

/**
 * Attempts to acquire an exclusive execution lease for a (connectionId, capability) partition.
 * Fails closed if another active, unexpired lease is running.
 */
export async function acquireSyncLease(
  connectionId: string,
  capability: string,
  syncRunId: string,
  leaseDurationMs = 30000,
  db: AppDb = getDb(),
): Promise<AcquireLeaseResult> {
  const now = new Date();

  // 1. Check for any active running lease on the same connection partition
  const [activeLease] = await db
    .select({
      id: syncRuns.id,
      leaseToken: syncRuns.leaseToken,
      leaseExpiresAt: syncRuns.leaseExpiresAt,
      status: syncRuns.status,
    })
    .from(syncRuns)
    .where(
      and(
        eq(syncRuns.connectionId, connectionId),
        eq(syncRuns.capability, capability),
        eq(syncRuns.status, "running"),
        gt(syncRuns.leaseExpiresAt, now),
      ),
    )
    .limit(1);

  if (activeLease && activeLease.id !== syncRunId) {
    return {
      acquired: false,
      activeRunId: activeLease.id,
      error: `Connection partition '${capability}' is locked by active sync run '${activeLease.id}' until ${activeLease.leaseExpiresAt?.toISOString()}`,
    };
  }

  // 2. Acquire lease
  const leaseToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + leaseDurationMs);

  await db
    .update(syncRuns)
    .set({
      leaseToken,
      leaseExpiresAt: expiresAt,
      status: "running",
      startedAt: now,
      updatedAt: now,
    })
    .where(eq(syncRuns.id, syncRunId));

  return {
    acquired: true,
    leaseToken,
    expiresAt,
  };
}

/**
 * Renews an existing lease heartbeat to prevent stale timeouts during long pagination runs.
 */
export async function renewSyncLease(
  syncRunId: string,
  leaseToken: string,
  leaseDurationMs = 30000,
  db: AppDb = getDb(),
): Promise<boolean> {
  const expiresAt = new Date(Date.now() + leaseDurationMs);

  const result = await db
    .update(syncRuns)
    .set({
      leaseExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(syncRuns.id, syncRunId),
        eq(syncRuns.leaseToken, leaseToken),
        eq(syncRuns.status, "running"),
      ),
    )
    .returning({ id: syncRuns.id });

  return result.length > 0;
}

/**
 * Releases a lease upon run completion or cancellation.
 */
export async function releaseSyncLease(
  syncRunId: string,
  leaseToken?: string,
  db: AppDb = getDb(),
): Promise<void> {
  const whereClause = leaseToken
    ? and(eq(syncRuns.id, syncRunId), eq(syncRuns.leaseToken, leaseToken))
    : eq(syncRuns.id, syncRunId);

  await db
    .update(syncRuns)
    .set({
      leaseToken: null,
      leaseExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(whereClause);
}
