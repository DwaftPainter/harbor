import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/db/schema/index";
import { listAuditEvents } from "../src/features/audit/server/audit-service";
import { ForbiddenError } from "../src/features/authorization/server/authorization-service";
import { createConnection } from "../src/features/connections/server/connection-service";
import {
  acceptInvitation,
  createInvitation,
} from "../src/features/organizations/server/invitation-service";
import { createOrganization } from "../src/features/organizations/server/organization-service";
import {
  cancelSyncRun,
  executeSyncRun,
  listDiscoveredResources,
  listSyncRuns,
  queueSyncRun,
} from "../src/features/sync/server/sync-engine";
import { acquireSyncLease } from "../src/features/sync/server/sync-lease";

async function setupTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  const migrations = [
    "../src/db/migrations/0000_mature_the_santerians.sql",
    "../src/db/migrations/0001_moaning_boom_boom.sql",
    "../src/db/migrations/0002_marvelous_dragon_lord.sql",
    "../src/db/migrations/0003_faithful_silver_sable.sql",
    "../src/db/migrations/0004_wet_cobalt_man.sql",
    "../src/db/migrations/0005_fresh_kitty_pryde.sql",
    "../src/db/migrations/0006_ambitious_lightspeed.sql",
  ];

  for (const m of migrations) {
    const content = await readFile(new URL(m, import.meta.url), "utf8");
    for (const statement of content.split("--> statement-breakpoint")) {
      if (statement.trim()) {
        await client.exec(statement);
      }
    }
  }

  return { client, db };
}

test("sync engine lifecycle: queue, execution, idempotent upsert, and stale reconciliation", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "Sync Lab", slug: "sync-lab" },
      ownerId,
      db,
    );

    // Create a Neon Connection
    const conn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "neon",
        name: "Neon Production",
        credentials: { apiKey: "neon_test_live_key" },
      },
      db,
    );

    // 1. Queue and execute a sync run
    const queued = await queueSyncRun(
      org.id,
      conn.id,
      ownerId,
      { capability: "full", trigger: "manual" },
      db,
    );

    assert.equal(queued.status, "queued");
    assert.equal(queued.capability, "full");

    const executed = await executeSyncRun(queued.id, db);
    assert.equal(executed.status, "succeeded");
    assert.equal(executed.itemsObserved, 3);
    assert.equal(executed.itemsCreated, 3);
    assert.equal(executed.itemsUpdated, 0);
    assert.equal(executed.itemsStale, 0);
    assert.ok(executed.finishedAt);
    assert.equal(executed.leaseToken, null, "Lease must be released");

    // 2. Verify discovered resources table
    const resources = await listDiscoveredResources(
      org.id,
      conn.id,
      ownerId,
      db,
    );
    assert.equal(resources.length, 3);
    const names = resources.map((r) => r.name);
    assert.ok(names.includes("alpha-production-db"));
    assert.ok(names.includes("beta-staging-db"));
    assert.ok(names.includes("analytics_warehouse"));

    // 3. Idempotent re-execution does NOT duplicate rows
    const queued2 = await queueSyncRun(
      org.id,
      conn.id,
      ownerId,
      { capability: "full", trigger: "manual" },
      db,
    );
    const executed2 = await executeSyncRun(queued2.id, db);
    assert.equal(executed2.status, "succeeded");
    assert.equal(executed2.itemsObserved, 3);
    assert.equal(executed2.itemsCreated, 0, "No new items should be created");
    assert.equal(executed2.itemsUpdated, 3, "All items should be updated");

    const resourcesAfterRerun = await listDiscoveredResources(
      org.id,
      conn.id,
      ownerId,
      db,
    );
    assert.equal(resourcesAfterRerun.length, 3);

    // 4. Stale resource reconciliation test:
    // Insert a dummy old resource that is no longer returned by the provider
    const oldResourceId = "old_deleted_resource_1";
    await db.insert(schema.discoveredResources).values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      connectionId: conn.id,
      providerId: "neon",
      resourceKind: "project",
      externalId: oldResourceId,
      name: "old-deleted-project",
      status: "ready",
      lastSeenAt: new Date(Date.now() - 3600000), // 1 hour ago
      isStale: false,
    });

    const queued3 = await queueSyncRun(
      org.id,
      conn.id,
      ownerId,
      { capability: "full", trigger: "manual" },
      db,
    );
    const executed3 = await executeSyncRun(queued3.id, db);
    assert.equal(executed3.itemsStale, 1, "Old item must be marked stale");

    const [staleItem] = await db
      .select()
      .from(schema.discoveredResources)
      .where(
        and(
          eq(schema.discoveredResources.connectionId, conn.id),
          eq(schema.discoveredResources.externalId, oldResourceId),
        ),
      );
    assert.equal(staleItem?.isStale, true);

    // 5. Verify audit event emission
    const auditRes = await listAuditEvents(org.id, ownerId, {}, db);
    const actions = auditRes.events.map((e) => e.action);
    assert.ok(actions.includes("sync.triggered"));
    assert.ok(actions.includes("sync.completed"));
  } finally {
    await client.close();
  }
});

test("sync lease locking and cancellation", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "Lock Lab", slug: "lock-lab" },
      ownerId,
      db,
    );

    const conn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "vercel",
        name: "Vercel Production",
        credentials: { token: "vercel_test_token" },
      },
      db,
    );

    // 1. Queue run 1 and run 2 on the same partition
    const run1 = await queueSyncRun(
      org.id,
      conn.id,
      ownerId,
      { capability: "full" },
      db,
    );
    const run2 = await queueSyncRun(
      org.id,
      conn.id,
      ownerId,
      { capability: "full" },
      db,
    );

    // Acquire lease on run1
    const lease1 = await acquireSyncLease(conn.id, "full", run1.id, 30000, db);
    assert.equal(lease1.acquired, true);

    // Attempt to acquire lease on run2 -> must be rejected / locked
    const lease2 = await acquireSyncLease(conn.id, "full", run2.id, 30000, db);
    assert.equal(lease2.acquired, false);
    assert.equal(lease2.activeRunId, run1.id);

    // 2. Cancellation of run2
    const cancelledRun = await cancelSyncRun(org.id, run2.id, ownerId, db);
    assert.equal(cancelledRun.status, "cancelled");
  } finally {
    await client.close();
  }
});

test("sync tenant isolation and RBAC enforcement", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerAId = "owner-a";
    const viewerAId = "viewer-a";
    const ownerBId = "owner-b";

    await db.insert(schema.user).values([
      { id: ownerAId, name: "Owner A", email: "ownera@test.com" },
      { id: viewerAId, name: "Viewer A", email: "viewera@test.com" },
      { id: ownerBId, name: "Owner B", email: "ownerb@test.com" },
    ]);

    const orgA = await createOrganization(
      { name: "Tenant A", slug: "tenant-a" },
      ownerAId,
      db,
    );
    const orgB = await createOrganization(
      { name: "Tenant B", slug: "tenant-b" },
      ownerBId,
      db,
    );

    const { token: viewerInviteToken } = await createInvitation(
      orgA.id,
      { email: "viewera@test.com", role: "viewer" },
      ownerAId,
      db,
    );
    await acceptInvitation(viewerInviteToken, viewerAId, db);

    const connA = await createConnection(
      orgA.id,
      ownerAId,
      {
        providerId: "render",
        name: "Render App",
        credentials: { apiKey: "rnd_test_key" },
      },
      db,
    );

    const runA = await queueSyncRun(orgA.id, connA.id, ownerAId, {}, db);
    await executeSyncRun(runA.id, db);

    // 1. Org B cannot list Org A sync runs
    const orgBRuns = await listSyncRuns(orgB.id, connA.id, ownerBId, 10, db);
    assert.equal(orgBRuns.length, 0);

    // 2. Org B cannot list Org A discovered resources
    const orgBResources = await listDiscoveredResources(
      orgB.id,
      connA.id,
      ownerBId,
      db,
    );
    assert.equal(orgBResources.length, 0);

    // 3. Viewer cannot queue a sync run (ForbiddenError 403)
    await assert.rejects(
      async () => {
        await queueSyncRun(orgA.id, connA.id, viewerAId, {}, db);
      },
      (err: unknown) => err instanceof ForbiddenError && err.statusCode === 403,
    );
  } finally {
    await client.close();
  }
});
