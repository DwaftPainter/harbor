import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/db/schema/index";
import { ForbiddenError } from "../src/features/authorization/server/authorization-service";
import { createConnection } from "../src/features/connections/server/connection-service";
import {
  acceptInvitation,
  createInvitation,
} from "../src/features/organizations/server/invitation-service";
import { createOrganization } from "../src/features/organizations/server/organization-service";
import {
  getResourceById,
  listResources,
} from "../src/features/resources/server/resource-service";
import {
  executeSyncRun,
  queueSyncRun,
} from "../src/features/sync/server/sync-engine";

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

test("resource inventory lifecycle: synchronization, normalization, and relationship inference", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "Resource Hub", slug: "resource-hub" },
      ownerId,
      db,
    );

    // 1. Create Neon connection & sync
    const neonConn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "neon",
        name: "Neon Production",
        credentials: { apiKey: "neon_test_key" },
      },
      db,
    );

    const queuedNeon = await queueSyncRun(org.id, neonConn.id, ownerId, {}, db);
    await executeSyncRun(queuedNeon.id, db);

    // 2. Query resources
    const neonResList = await listResources(
      org.id,
      ownerId,
      { connectionId: neonConn.id },
      db,
    );
    assert.equal(neonResList.data.length, 3);

    for (const r of neonResList.data) {
      assert.equal(r.normalizedStatus, "running");
      assert.equal(r.connectionName, "Neon Production");
    }

    // 3. Verify automatic relationship inference (Neon project -> database)
    const neonProject = neonResList.data.find(
      (r) => r.name === "alpha-production-db",
    );
    assert.ok(neonProject);

    const projectDetail = await getResourceById(
      org.id,
      neonProject.id,
      ownerId,
      db,
    );
    assert.ok(projectDetail);
    assert.ok(
      projectDetail.outgoingRelationships.length >= 1,
      "Expected outgoing relationship from project to database",
    );
    assert.equal(
      projectDetail.outgoingRelationships[0]?.relationshipType,
      "parent_of",
    );

    // 4. Create Vercel connection & sync
    const vercelConn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "vercel",
        name: "Vercel Web",
        credentials: { token: "vercel_test_token" },
      },
      db,
    );
    const queuedVercel = await queueSyncRun(
      org.id,
      vercelConn.id,
      ownerId,
      {},
      db,
    );
    await executeSyncRun(queuedVercel.id, db);

    const allResources = await listResources(
      org.id,
      ownerId,
      { pageSize: 50 },
      db,
    );
    assert.equal(
      allResources.data.length,
      5,
      "Expected 3 Neon + 2 Vercel resources",
    );
  } finally {
    await client.close();
  }
});

test("resource inventory: deterministic opaque cursor pagination", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "Paging Lab", slug: "paging-lab" },
      ownerId,
      db,
    );

    const conn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "render",
        name: "Render App",
        credentials: { apiKey: "rnd_test_key" },
      },
      db,
    );

    // Insert 6 dummy resources
    for (let i = 1; i <= 6; i++) {
      await db.insert(schema.externalResources).values({
        id: `res_item_${i}`,
        organizationId: org.id,
        connectionId: conn.id,
        providerId: "render",
        resourceKind: "service",
        externalId: `srv_render_${i}`,
        name: `service-tier-${i}`,
        status: "live",
        normalizedStatus: "running",
        createdAt: new Date(Date.now() - i * 1000), // Distinct timestamps
      });
    }

    // Page 1: pageSize = 2
    const page1 = await listResources(org.id, ownerId, { pageSize: 2 }, db);
    assert.equal(page1.data.length, 2);
    assert.equal(page1.page.hasMore, true);
    assert.ok(page1.page.nextCursor);

    // Page 2: with cursor from page 1
    const page2 = await listResources(
      org.id,
      ownerId,
      { pageSize: 2, cursor: page1.page.nextCursor! },
      db,
    );
    assert.equal(page2.data.length, 2);
    assert.equal(page2.page.hasMore, true);
    assert.ok(page2.page.nextCursor);

    // Ensure no overlap between page 1 and page 2
    const page1Ids = page1.data.map((r) => r.id);
    const page2Ids = page2.data.map((r) => r.id);
    for (const id of page2Ids) {
      assert.equal(
        page1Ids.includes(id),
        false,
        "Page 2 must not contain items from Page 1",
      );
    }
  } finally {
    await client.close();
  }
});

test("resource inventory: multi-facet filtering and search", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "Filter Lab", slug: "filter-lab" },
      ownerId,
      db,
    );

    const conn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "neon",
        name: "Neon Multi",
        credentials: { apiKey: "neon_test_key" },
      },
      db,
    );

    await db.insert(schema.externalResources).values([
      {
        id: "res_a",
        organizationId: org.id,
        connectionId: conn.id,
        providerId: "neon",
        resourceKind: "project",
        externalId: "prj_alpha_1",
        name: "finance-backend",
        status: "ready",
        normalizedStatus: "running",
        isStale: false,
      },
      {
        id: "res_b",
        organizationId: org.id,
        connectionId: conn.id,
        providerId: "neon",
        resourceKind: "database",
        externalId: "db_alpha_2",
        name: "finance-primary-db",
        status: "ready",
        normalizedStatus: "running",
        isStale: false,
      },
      {
        id: "res_c",
        organizationId: org.id,
        connectionId: conn.id,
        providerId: "neon",
        resourceKind: "database",
        externalId: "db_legacy_3",
        name: "legacy-archive-db",
        status: "disabled",
        normalizedStatus: "stopped",
        isStale: true,
      },
    ]);

    // 1. Kind filter: database
    const dbList = await listResources(
      org.id,
      ownerId,
      { kind: "database" },
      db,
    );
    assert.equal(dbList.data.length, 2);

    // 2. Status filter: stopped
    const stoppedList = await listResources(
      org.id,
      ownerId,
      { status: "stopped" },
      db,
    );
    assert.equal(stoppedList.data.length, 1);
    assert.equal(stoppedList.data[0]?.name, "legacy-archive-db");

    // 3. Stale filter: isStale = true
    const staleList = await listResources(
      org.id,
      ownerId,
      { isStale: true },
      db,
    );
    assert.equal(staleList.data.length, 1);

    // 4. Search query: "finance"
    const searchList = await listResources(
      org.id,
      ownerId,
      { search: "finance" },
      db,
    );
    assert.equal(searchList.data.length, 2);
  } finally {
    await client.close();
  }
});

test("resource inventory: tenant isolation and RBAC enforcement", async () => {
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

    const { token: viewerInvite } = await createInvitation(
      orgA.id,
      { email: "viewera@test.com", role: "viewer" },
      ownerAId,
      db,
    );
    await acceptInvitation(viewerInvite, viewerAId, db);

    const connA = await createConnection(
      orgA.id,
      ownerAId,
      {
        providerId: "neon",
        name: "Neon Tenant A",
        credentials: { apiKey: "neon_test_key" },
      },
      db,
    );

    const queuedA = await queueSyncRun(orgA.id, connA.id, ownerAId, {}, db);
    await executeSyncRun(queuedA.id, db);

    // 1. Viewer in Org A can list resources
    const viewerList = await listResources(orgA.id, viewerAId, {}, db);
    assert.equal(viewerList.data.length, 3);

    // 2. Org B cannot list Org A resources
    const orgBList = await listResources(orgB.id, ownerBId, {}, db);
    assert.equal(orgBList.data.length, 0);

    // 3. Org B cannot fetch Org A resource by ID (fails closed)
    const orgAResourceId = viewerList.data[0]!.id;
    const orgBDetail = await getResourceById(
      orgB.id,
      orgAResourceId,
      ownerBId,
      db,
    );
    assert.equal(orgBDetail, null);

    // 4. Non-member user querying Org A receives 403 ForbiddenError
    await assert.rejects(
      async () => {
        await listResources(orgA.id, ownerBId, {}, db);
      },
      (err: unknown) => err instanceof ForbiddenError && err.statusCode === 403,
    );
  } finally {
    await client.close();
  }
});
