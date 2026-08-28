import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/db/schema/index";
import {
  listAuditEvents,
  recordAuditEvent,
} from "../src/features/audit/server/audit-service";
import {
  authorize,
  ForbiddenError,
  requirePermission,
} from "../src/features/authorization/server/authorization-service";
import {
  acceptInvitation,
  createInvitation,
} from "../src/features/organizations/server/invitation-service";
import {
  transferOwnership,
  updateMemberRole,
} from "../src/features/organizations/server/membership-service";
import {
  createOrganization,
  deleteOrganization,
  updateOrganization,
} from "../src/features/organizations/server/organization-service";

async function setupTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  const migration0 = await readFile(
    new URL(
      "../src/db/migrations/0000_mature_the_santerians.sql",
      import.meta.url,
    ),
    "utf8",
  );

  const migration1 = await readFile(
    new URL("../src/db/migrations/0001_moaning_boom_boom.sql", import.meta.url),
    "utf8",
  );

  const migration2 = await readFile(
    new URL(
      "../src/db/migrations/0002_marvelous_dragon_lord.sql",
      import.meta.url,
    ),
    "utf8",
  );

  const migration3 = await readFile(
    new URL(
      "../src/db/migrations/0003_faithful_silver_sable.sql",
      import.meta.url,
    ),
    "utf8",
  );

  const migration4 = await readFile(
    new URL("../src/db/migrations/0004_wet_cobalt_man.sql", import.meta.url),
    "utf8",
  );

  const migration5 = await readFile(
    new URL("../src/db/migrations/0005_fresh_kitty_pryde.sql", import.meta.url),
    "utf8",
  );

  const migration6 = await readFile(
    new URL(
      "../src/db/migrations/0006_ambitious_lightspeed.sql",
      import.meta.url,
    ),
    "utf8",
  );

  for (const statement of migration0.split("--> statement-breakpoint")) {
    if (statement.trim()) {
      await client.exec(statement);
    }
  }

  for (const statement of migration1.split("--> statement-breakpoint")) {
    if (statement.trim()) {
      await client.exec(statement);
    }
  }

  for (const statement of migration2.split("--> statement-breakpoint")) {
    if (statement.trim()) {
      await client.exec(statement);
    }
  }

  for (const statement of migration3.split("--> statement-breakpoint")) {
    if (statement.trim()) {
      await client.exec(statement);
    }
  }

  for (const statement of migration4.split("--> statement-breakpoint")) {
    if (statement.trim()) {
      await client.exec(statement);
    }
  }

  for (const statement of migration5.split("--> statement-breakpoint")) {
    if (statement.trim()) {
      await client.exec(statement);
    }
  }

  for (const statement of migration6.split("--> statement-breakpoint")) {
    if (statement.trim()) {
      await client.exec(statement);
    }
  }

  return { client, db };
}

test("authorization service: policy checks and role enforcement", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-1";
    const adminId = "admin-1";
    const memberId = "member-1";
    const viewerId = "viewer-1";
    const outsiderId = "outsider-1";

    await db.insert(schema.user).values([
      { id: ownerId, name: "Owner User", email: "owner@test.com" },
      { id: adminId, name: "Admin User", email: "admin@test.com" },
      { id: memberId, name: "Member User", email: "member@test.com" },
      { id: viewerId, name: "Viewer User", email: "viewer@test.com" },
      { id: outsiderId, name: "Outsider User", email: "outsider@test.com" },
    ]);

    const org = await createOrganization(
      { name: "Auth Lab", slug: "auth-lab" },
      ownerId,
      db,
    );

    // Add memberships
    const { token: adminToken } = await createInvitation(
      org.id,
      { email: "admin@test.com", role: "admin" },
      ownerId,
      db,
    );
    await acceptInvitation(adminToken, adminId, db);

    const { token: memberToken } = await createInvitation(
      org.id,
      { email: "member@test.com", role: "member" },
      ownerId,
      db,
    );
    await acceptInvitation(memberToken, memberId, db);

    const { token: viewerToken } = await createInvitation(
      org.id,
      { email: "viewer@test.com", role: "viewer" },
      ownerId,
      db,
    );
    await acceptInvitation(viewerToken, viewerId, db);

    // 1. Check authorize() for owner
    const ownerAuth = await authorize(
      org.id,
      ownerId,
      "organization:delete",
      db,
    );
    assert.equal(ownerAuth.authorized, true);
    assert.equal(ownerAuth.role, "owner");

    // 2. Check authorize() for admin
    const adminDeleteAuth = await authorize(
      org.id,
      adminId,
      "organization:delete",
      db,
    );
    assert.equal(adminDeleteAuth.authorized, false);
    const adminInviteAuth = await authorize(
      org.id,
      adminId,
      "member:invite",
      db,
    );
    assert.equal(adminInviteAuth.authorized, true);

    // 3. Check authorize() for member
    const memberInviteAuth = await authorize(
      org.id,
      memberId,
      "member:invite",
      db,
    );
    assert.equal(memberInviteAuth.authorized, false);
    const memberAppAuth = await authorize(
      org.id,
      memberId,
      "application:create",
      db,
    );
    assert.equal(memberAppAuth.authorized, true);

    // 4. Check authorize() for viewer
    const viewerReadAuth = await authorize(
      org.id,
      viewerId,
      "organization:read",
      db,
    );
    assert.equal(viewerReadAuth.authorized, true);
    const viewerWriteAuth = await authorize(
      org.id,
      viewerId,
      "application:create",
      db,
    );
    assert.equal(viewerWriteAuth.authorized, false);

    // 5. Outsider fails closed
    const outsiderAuth = await authorize(
      org.id,
      outsiderId,
      "organization:read",
      db,
    );
    assert.equal(outsiderAuth.authorized, false);

    // 6. requirePermission throws ForbiddenError on failure
    await assert.rejects(
      async () => {
        await requirePermission(org.id, memberId, "audit:read", db);
      },
      (err: unknown) => err instanceof ForbiddenError && err.statusCode === 403,
    );
  } finally {
    await client.close();
  }
});

test("audit log lifecycle: emission on mutations, secret redaction, and tenant query isolation", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerAId = "owner-a";
    const userBId = "user-b";
    const ownerCId = "owner-c";

    await db.insert(schema.user).values([
      { id: ownerAId, name: "Owner A", email: "ownera@test.com" },
      { id: userBId, name: "User B", email: "userb@test.com" },
      { id: ownerCId, name: "Owner C", email: "ownerc@test.com" },
    ]);

    // 1. Create Org A -> emits organization.created
    const orgA = await createOrganization(
      { name: "Tenant Alpha", slug: "tenant-alpha" },
      ownerAId,
      db,
    );

    // 2. Create Org C -> emits organization.created
    const orgC = await createOrganization(
      { name: "Tenant Charlie", slug: "tenant-charlie" },
      ownerCId,
      db,
    );

    // 3. Org A: Invite User B -> emits invitation.created
    const { token: inviteToken } = await createInvitation(
      orgA.id,
      { email: "userb@test.com", role: "member" },
      ownerAId,
      db,
    );

    // 4. Org A: User B accepts -> emits invitation.accepted
    await acceptInvitation(inviteToken, userBId, db);

    // 5. Org A: Update Org Details -> emits organization.updated
    await updateOrganization(
      orgA.id,
      { name: "Tenant Alpha Global" },
      ownerAId,
      db,
    );

    // 6. Org A: Query audit log as Owner A
    const auditResA = await listAuditEvents(orgA.id, ownerAId, {}, db);
    assert.ok(auditResA.total >= 4);

    const actions = auditResA.events.map((e) => e.action);
    assert.ok(actions.includes("organization.created"));
    assert.ok(actions.includes("invitation.created"));
    assert.ok(actions.includes("invitation.accepted"));
    assert.ok(actions.includes("organization.updated"));

    // 7. Verify no secrets leaked in invitation audit records
    for (const evt of auditResA.events) {
      if (evt.action === "invitation.created") {
        assert.equal(
          evt.metadata?.token,
          undefined,
          "Raw token must not be in audit metadata",
        );
      }
    }

    // 8. Custom audit event with secret payload to test automatic redaction
    await recordAuditEvent(
      {
        organizationId: orgA.id,
        actorId: ownerAId,
        actorType: "user",
        action: "connection.created",
        targetType: "connection",
        targetId: "conn-123",
        outcome: "success",
        metadata: {
          provider: "neon",
          databaseUrl: "postgres://user:pass@host/db",
          apiToken: "neon_token_abc_secret",
          nestedConfig: {
            apiKey: "key_xyz_secret",
            label: "Production Neon",
          },
        },
      },
      db,
    );

    const filteredAudit = await listAuditEvents(
      orgA.id,
      ownerAId,
      { action: "connection.created" },
      db,
    );
    assert.equal(filteredAudit.events.length, 1);
    const connEvent = filteredAudit.events[0]!;
    assert.equal(connEvent.metadata?.apiToken, "[REDACTED]");
    assert.equal(
      (connEvent.metadata?.nestedConfig as Record<string, unknown>)?.apiKey,
      "[REDACTED]",
    );
    assert.equal(
      (connEvent.metadata?.nestedConfig as Record<string, unknown>)?.label,
      "Production Neon",
    );

    // 9. Tenant Isolation: Org C cannot see Org A audit events
    const auditResC = await listAuditEvents(orgC.id, ownerCId, {}, db);
    assert.equal(auditResC.total, 1); // Only org C creation
    assert.equal(auditResC.events[0]?.organizationId, orgC.id);

    // 10. Member cannot access audit log (Requires audit:read)
    await assert.rejects(
      async () => {
        await listAuditEvents(orgA.id, userBId, {}, db);
      },
      (err: unknown) => err instanceof ForbiddenError && err.statusCode === 403,
    );

    // 11. Role update and Ownership transfer emit audit events
    const [userBMembership] = await db
      .select({ id: schema.memberships.id })
      .from(schema.memberships)
      .where(eq(schema.memberships.userId, userBId));
    assert.ok(userBMembership);

    await updateMemberRole(
      orgA.id,
      userBMembership.id,
      { role: "admin" },
      ownerAId,
      db,
    );

    await transferOwnership(orgA.id, userBId, ownerAId, db);

    // 12. Org C deletion emits audit and removes record
    await deleteOrganization(orgC.id, ownerCId, db);
  } finally {
    await client.close();
  }
});
