import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/db/schema/index";
import { listAuditEvents } from "../src/features/audit/server/audit-service";
import { ForbiddenError } from "../src/features/authorization/server/authorization-service";
import {
  createConnection,
  getConnectionById,
  listConnections,
  revokeConnection,
  rotateConnectionCredentials,
  validateConnection,
} from "../src/features/connections/server/connection-service";
import {
  acceptInvitation,
  createInvitation,
} from "../src/features/organizations/server/invitation-service";
import { createOrganization } from "../src/features/organizations/server/organization-service";

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

test("connection lifecycle: creation, encryption, validation, rotation, and revocation", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-user";
    const memberId = "member-user";
    const outsiderId = "outsider-user";

    await db.insert(schema.user).values([
      { id: ownerId, name: "Owner User", email: "owner@test.com" },
      { id: memberId, name: "Member User", email: "member@test.com" },
      { id: outsiderId, name: "Outsider User", email: "outsider@test.com" },
    ]);

    const org = await createOrganization(
      { name: "Cloud Ops", slug: "cloud-ops" },
      ownerId,
      db,
    );

    const { token: memberInviteToken } = await createInvitation(
      org.id,
      { email: "member@test.com", role: "member" },
      ownerId,
      db,
    );
    await acceptInvitation(memberInviteToken, memberId, db);

    // 1. Create a Neon Connection
    const rawApiKey = "neon_test_live_key_987654321";
    const conn = await createConnection(
      org.id,
      ownerId,
      {
        providerId: "neon",
        name: "Primary Neon Database",
        credentials: { apiKey: rawApiKey },
      },
      db,
    );

    assert.equal(conn.providerId, "neon");
    assert.equal(conn.name, "Primary Neon Database");
    assert.equal(conn.status, "connected");
    assert.ok(conn.fingerprint, "Fingerprint must be present");
    assert.equal(conn.externalAccountName, "Neon Sandbox Organization");

    // 2. Verify encrypted persistence at rest in DB
    const [credRow] = await db
      .select()
      .from(schema.connectionCredentials)
      .where(eq(schema.connectionCredentials.connectionId, conn.id));

    assert.ok(credRow, "Credential envelope row must exist");
    assert.ok(credRow.encryptedData, "Encrypted data must exist");
    assert.ok(credRow.iv, "IV must exist");
    assert.ok(credRow.authTag, "AuthTag must exist");
    assert.equal(
      credRow.encryptedData.includes(rawApiKey),
      false,
      "Ciphertext must not contain plaintext API key",
    );

    // 3. Validate connection test
    const { connection: validatedConn, validation } = await validateConnection(
      org.id,
      conn.id,
      ownerId,
      db,
    );

    assert.equal(validation.valid, true);
    assert.equal(validatedConn.status, "connected");
    assert.ok(validatedConn.lastValidatedAt);

    // 4. Rotate credentials
    const newApiKey = "neon_test_rotated_key_1122334455";
    const rotatedConn = await rotateConnectionCredentials(
      org.id,
      conn.id,
      ownerId,
      { credentials: { apiKey: newApiKey } },
      db,
    );

    assert.notEqual(rotatedConn.fingerprint, conn.fingerprint);

    const [updatedCredRow] = await db
      .select()
      .from(schema.connectionCredentials)
      .where(eq(schema.connectionCredentials.connectionId, conn.id));

    assert.notEqual(updatedCredRow?.encryptedData, credRow.encryptedData);
    assert.equal(updatedCredRow?.fingerprint, rotatedConn.fingerprint);

    // 5. Query Audit Logs for Connection Actions
    const auditRes = await listAuditEvents(org.id, ownerId, {}, db);
    const actions = auditRes.events.map((e) => e.action);
    assert.ok(actions.includes("connection.created"));
    assert.ok(actions.includes("connection.updated"));

    // Verify no cleartext leaked in audit metadata
    for (const evt of auditRes.events) {
      if (evt.action.startsWith("connection.")) {
        assert.equal(
          evt.metadata?.apiKey,
          undefined,
          "No apiKey in audit metadata",
        );
      }
    }

    // 6. Revoke Connection
    await revokeConnection(org.id, conn.id, ownerId, db);

    const revokedConn = await getConnectionById(org.id, conn.id, ownerId, db);
    assert.equal(revokedConn, null, "Connection should be removed");

    const [postRevokeCred] = await db
      .select()
      .from(schema.connectionCredentials)
      .where(eq(schema.connectionCredentials.connectionId, conn.id));
    assert.equal(
      postRevokeCred,
      undefined,
      "Credentials must be cascade deleted",
    );
  } finally {
    await client.close();
  }
});

test("connection tenant isolation and RBAC policy enforcement", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerAId = "owner-a";
    const memberAId = "member-a";
    const ownerBId = "owner-b";

    await db.insert(schema.user).values([
      { id: ownerAId, name: "Owner A", email: "ownera@test.com" },
      { id: memberAId, name: "Member A", email: "membera@test.com" },
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

    const { token: inviteToken } = await createInvitation(
      orgA.id,
      { email: "membera@test.com", role: "member" },
      ownerAId,
      db,
    );
    await acceptInvitation(inviteToken, memberAId, db);

    // Create Connection in Org A
    const connA = await createConnection(
      orgA.id,
      ownerAId,
      {
        providerId: "vercel",
        name: "Vercel Production",
        credentials: { token: "vercel_test_token_abc" },
      },
      db,
    );

    // 1. Org B cannot list Org A connections
    const orgBConns = await listConnections(orgB.id, ownerBId, db);
    assert.equal(orgBConns.length, 0);

    // 2. Org B cannot access Org A connection by ID
    const crossAccess = await getConnectionById(
      orgB.id,
      connA.id,
      ownerBId,
      db,
    );
    assert.equal(crossAccess, null);

    // 3. Member cannot create connections (ForbiddenError 403)
    await assert.rejects(
      async () => {
        await createConnection(
          orgA.id,
          memberAId,
          {
            providerId: "render",
            name: "Render App",
            credentials: { apiKey: "rnd_test_key" },
          },
          db,
        );
      },
      (err: unknown) => err instanceof ForbiddenError && err.statusCode === 403,
    );

    // 4. Member cannot delete connections (ForbiddenError 403)
    await assert.rejects(
      async () => {
        await revokeConnection(orgA.id, connA.id, memberAId, db);
      },
      (err: unknown) => err instanceof ForbiddenError && err.statusCode === 403,
    );
  } finally {
    await client.close();
  }
});
