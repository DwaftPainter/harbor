import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/db/schema/index";
import {
  archiveApplication,
  createApplication,
  getApplicationById,
  listApplications,
  unarchiveApplication,
  updateApplication,
} from "../src/features/applications/server/application-service";
import {
  bindResource,
  getBindingSuggestions,
  listBindings,
  unbindResource,
} from "../src/features/applications/server/binding-service";
import {
  archiveEnvironment,
  createEnvironment,
  listEnvironments,
  updateEnvironment,
} from "../src/features/applications/server/environment-service";
import { ForbiddenError } from "../src/features/authorization/server/authorization-service";
import { createConnection } from "../src/features/connections/server/connection-service";
import { createOrganization } from "../src/features/organizations/server/organization-service";
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

test("application and environment lifecycle: creation, default environments, and updates", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "App Lab", slug: "app-lab" },
      ownerId,
      db,
    );

    // 1. Create Application with default environments
    const app = await createApplication(
      org.id,
      ownerId,
      {
        name: "E-Commerce Core",
        description: "Primary store and APIs",
        defaultEnvironments: true,
      },
      db,
    );

    assert.equal(app.name, "E-Commerce Core");
    assert.equal(app.slug, "e-commerce-core");
    assert.equal(app.environments.length, 3);

    const prodEnv = app.environments.find((e) => e.slug === "production");
    assert.ok(prodEnv);
    assert.equal(prodEnv.isProduction, true);

    // 2. Query application detail
    const detail = await getApplicationById(org.id, app.id, ownerId, db);
    assert.ok(detail);
    assert.equal(detail.name, "E-Commerce Core");
    assert.equal(detail.environments.length, 3);

    // 3. Update application properties
    const updated = await updateApplication(
      org.id,
      app.id,
      ownerId,
      { name: "E-Commerce Platform", description: "Updated description" },
      db,
    );
    assert.equal(updated.name, "E-Commerce Platform");
    assert.equal(updated.description, "Updated description");

    // 4. Create custom environment
    const customEnv = await createEnvironment(
      org.id,
      app.id,
      ownerId,
      { name: "QA Sandbox", classification: "staging" },
      db,
    );
    assert.equal(customEnv.name, "QA Sandbox");
    assert.equal(customEnv.slug, "qa-sandbox");

    const allEnvs = await listEnvironments(org.id, app.id, ownerId, {}, db);
    assert.equal(allEnvs.length, 4);

    // 5. Update environment production designation (single production safeguard)
    const updatedCustom = await updateEnvironment(
      org.id,
      customEnv.id,
      ownerId,
      { isProduction: true },
      db,
    );
    assert.equal(updatedCustom.isProduction, true);

    const envsAfterProdSwitch = await listEnvironments(
      org.id,
      app.id,
      ownerId,
      {},
      db,
    );
    const oldProd = envsAfterProdSwitch.find((e) => e.id === prodEnv.id);
    assert.equal(
      oldProd?.isProduction,
      false,
      "Previous production env should be unset",
    );

    // 6. Archive custom environment
    const archivedEnv = await archiveEnvironment(
      org.id,
      customEnv.id,
      ownerId,
      db,
    );
    assert.equal(archivedEnv.isArchived, true);

    const activeEnvs = await listEnvironments(org.id, app.id, ownerId, {}, db);
    assert.equal(activeEnvs.length, 3);
  } finally {
    await client.close();
  }
});

test("resource binding lifecycle: bind, unbind, primary designation, and suggestions", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "Binding Lab", slug: "binding-lab" },
      ownerId,
      db,
    );

    // Create cloud connection & sync Neon resources
    const neonConn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "neon",
        name: "Neon Storefront",
        credentials: { apiKey: "neon_test_key" },
      },
      db,
    );

    const queuedSync = await queueSyncRun(org.id, neonConn.id, ownerId, {}, db);
    await executeSyncRun(queuedSync.id, db);

    // Create Application
    const app = await createApplication(
      org.id,
      ownerId,
      { name: "Alpha Store", slug: "alpha-store", defaultEnvironments: true },
      db,
    );

    const prodEnv = app.environments.find((e) => e.slug === "production")!;
    assert.ok(prodEnv);

    // 1. Evaluate suggestions
    const suggestions = await getBindingSuggestions(
      org.id,
      app.id,
      ownerId,
      db,
    );
    assert.ok(Array.isArray(suggestions));

    // Get discovered database resource
    const [dbResource] = await db
      .select()
      .from(schema.externalResources)
      .where(eq(schema.externalResources.organizationId, org.id))
      .limit(1);

    assert.ok(dbResource);

    // 2. Explicitly bind resource to production environment
    const binding = await bindResource(
      org.id,
      app.id,
      ownerId,
      {
        environmentId: prodEnv.id,
        resourceId: dbResource.id,
        isPrimary: true,
        bindingSource: "manual",
      },
      db,
    );

    assert.equal(binding.applicationId, app.id);
    assert.equal(binding.environmentId, prodEnv.id);
    assert.equal(binding.resourceId, dbResource.id);
    assert.equal(binding.isPrimary, true);

    // 3. List bindings
    const bindingsList = await listBindings(
      org.id,
      app.id,
      ownerId,
      prodEnv.id,
      db,
    );
    assert.equal(bindingsList.length, 1);
    assert.equal(bindingsList[0]?.resource?.name, dbResource.name);

    // 4. Unbind resource
    await unbindResource(org.id, binding.id, ownerId, db);

    const emptyBindings = await listBindings(
      org.id,
      app.id,
      ownerId,
      prodEnv.id,
      db,
    );
    assert.equal(emptyBindings.length, 0);
  } finally {
    await client.close();
  }
});

test("application archive and unarchive lifecycle", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    await db
      .insert(schema.user)
      .values([{ id: ownerId, name: "Owner User", email: "owner@test.com" }]);

    const org = await createOrganization(
      { name: "Archive Lab", slug: "archive-lab" },
      ownerId,
      db,
    );

    const app = await createApplication(
      org.id,
      ownerId,
      { name: "Old Legacy App" },
      db,
    );

    // 1. Archive application
    const archived = await archiveApplication(org.id, app.id, ownerId, db);
    assert.equal(archived.isArchived, true);
    assert.ok(archived.archivedAt);

    // 2. Standard listing excludes archived by default
    const activeList = await listApplications(org.id, ownerId, {}, db);
    assert.equal(activeList.length, 0);

    // 3. Listing with includeArchived returns it
    const allList = await listApplications(
      org.id,
      ownerId,
      { includeArchived: true },
      db,
    );
    assert.equal(allList.length, 1);

    // 4. Unarchive application
    const unarchived = await unarchiveApplication(org.id, app.id, ownerId, db);
    assert.equal(unarchived.isArchived, false);
    assert.equal(unarchived.archivedAt, null);

    const restoredList = await listApplications(org.id, ownerId, {}, db);
    assert.equal(restoredList.length, 1);
  } finally {
    await client.close();
  }
});

test("application tenant isolation and cross-organization binding rejection", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerAId = "owner-a";
    const ownerBId = "owner-b";

    await db.insert(schema.user).values([
      { id: ownerAId, name: "Owner A", email: "ownera@test.com" },
      { id: ownerBId, name: "Owner B", email: "ownerb@test.com" },
    ]);

    const orgA = await createOrganization(
      { name: "Org A", slug: "org-a" },
      ownerAId,
      db,
    );
    const orgB = await createOrganization(
      { name: "Org B", slug: "org-b" },
      ownerBId,
      db,
    );

    const appA = await createApplication(
      orgA.id,
      ownerAId,
      { name: "App A" },
      db,
    );
    const prodEnvA = appA.environments.find((e) => e.slug === "production")!;

    // Create connection and resource in Org B
    const connB = await createConnection(
      orgB.id,
      ownerBId,
      {
        providerId: "neon",
        name: "Neon Org B",
        credentials: { apiKey: "neon_test_key_b" },
      },
      db,
    );
    const queuedB = await queueSyncRun(orgB.id, connB.id, ownerBId, {}, db);
    await executeSyncRun(queuedB.id, db);

    const [resourceB] = await db
      .select()
      .from(schema.externalResources)
      .where(eq(schema.externalResources.organizationId, orgB.id))
      .limit(1);

    assert.ok(resourceB);

    // 1. Attempting to bind Org B's resource to Org A's application MUST fail
    await assert.rejects(async () => {
      await bindResource(
        orgA.id,
        appA.id,
        ownerAId,
        {
          environmentId: prodEnvA.id,
          resourceId: resourceB.id,
          bindingSource: "manual",
        },
        db,
      );
    }, /Resource not found or does not belong to this organization/);

    // 2. Non-member access to Org A applications fails with ForbiddenError (403)
    await assert.rejects(
      async () => {
        await listApplications(orgA.id, ownerBId, {}, db);
      },
      (err: unknown) => err instanceof ForbiddenError && err.statusCode === 403,
    );
  } finally {
    await client.close();
  }
});
