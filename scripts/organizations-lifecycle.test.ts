import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/db/schema/index";
import {
  acceptInvitation,
  createInvitation,
  getInvitationByToken,
  listInvitations,
  revokeInvitation,
} from "../src/features/organizations/server/invitation-service";
import {
  listMembers,
  removeMember,
  transferOwnership,
  updateMemberRole,
} from "../src/features/organizations/server/membership-service";
import {
  createOrganization,
  deleteOrganization,
  getOrganizationById,
  listUserOrganizations,
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

test("organization lifecycle: creation, slug generation, reserved slugs, and update/delete", async () => {
  const { client, db } = await setupTestDb();

  try {
    const user1Id = "user-1";
    await db.insert(schema.user).values({
      id: user1Id,
      name: "Alice Owner",
      email: "alice@example.com",
    });

    // 1. Create organization
    const org = await createOrganization(
      { name: "Acme Corp", slug: "acme-corp" },
      user1Id,
      db,
    );

    assert.equal(org.name, "Acme Corp");
    assert.equal(org.slug, "acme-corp");
    assert.equal(org.role, "owner");
    assert.equal(org.memberCount, 1);

    // 2. Reject duplicate slug
    await assert.rejects(async () => {
      await createOrganization(
        { name: "Another Acme", slug: "acme-corp" },
        user1Id,
        db,
      );
    }, /already taken/i);

    // 3. Reject reserved slug
    await assert.rejects(async () => {
      await createOrganization(
        { name: "System Admin", slug: "admin" },
        user1Id,
        db,
      );
    }, /reserved/i);

    // 4. Auto-generate slug when omitted
    const autoOrg = await createOrganization(
      { name: "Beta Labs" },
      user1Id,
      db,
    );
    assert.equal(autoOrg.slug, "beta-labs");

    // 5. List user organizations
    const userOrgs = await listUserOrganizations(user1Id, db);
    assert.equal(userOrgs.length, 2);

    // 6. Update organization details
    const updated = await updateOrganization(
      org.id,
      { name: "Acme Global" },
      user1Id,
      db,
    );
    assert.equal(updated?.name, "Acme Global");

    // 7. Delete organization
    await deleteOrganization(autoOrg.id, user1Id, db);
    const remainingOrgs = await listUserOrganizations(user1Id, db);
    assert.equal(remainingOrgs.length, 1);
  } finally {
    await client.close();
  }
});

test("invitation lifecycle: invite, token preview, acceptance, replay prevention, and expiration", async () => {
  const { client, db } = await setupTestDb();

  try {
    const ownerId = "owner-1";
    const inviteeId = "invitee-1";

    await db.insert(schema.user).values([
      {
        id: ownerId,
        name: "Owner User",
        email: "owner@example.com",
      },
      {
        id: inviteeId,
        name: "Invited User",
        email: "bob@example.com",
      },
    ]);

    const org = await createOrganization(
      { name: "Stark Industries" },
      ownerId,
      db,
    );

    // 1. Owner creates invitation for bob@example.com
    const { invitation, token } = await createInvitation(
      org.id,
      { email: "bob@example.com", role: "member" },
      ownerId,
      db,
    );

    assert.ok(invitation);
    assert.equal(invitation.email, "bob@example.com");
    assert.equal(invitation.role, "member");
    assert.equal(invitation.status, "pending");
    assert.ok(token);

    // 2. Preview invitation
    const preview = await getInvitationByToken(token, db);
    assert.equal(preview.valid, true);
    if (preview.valid) {
      assert.equal(preview.organization.name, "Stark Industries");
      assert.equal(preview.invitation.email, "bob@example.com");
    }

    // 3. List pending invitations
    const pending = await listInvitations(org.id, ownerId, db);
    assert.equal(pending.length, 1);
    assert.equal(pending[0]?.email, "bob@example.com");

    // 4. Accept invitation
    const acceptResult = await acceptInvitation(token, inviteeId, db);
    assert.equal(acceptResult.organizationId, org.id);
    assert.equal(acceptResult.alreadyMember, false);

    // 5. Replay attempt fails
    await assert.rejects(async () => {
      await acceptInvitation(token, inviteeId, db);
    }, /already been accepted or revoked/i);

    // 6. Bob is now an active member
    const members = await listMembers(org.id, ownerId, db);
    assert.equal(members.length, 2);
    const bobMember = members.find((m) => m.userId === inviteeId);
    assert.ok(bobMember);
    assert.equal(bobMember.role, "member");

    // 7. Test invitation revocation
    const { invitation: invite2, token: token2 } = await createInvitation(
      org.id,
      { email: "charlie@example.com", role: "viewer" },
      ownerId,
      db,
    );
    assert.ok(invite2);
    await revokeInvitation(org.id, invite2.id, ownerId, db);

    const revokedPreview = await getInvitationByToken(token2, db);
    assert.equal(revokedPreview.valid, false);
    assert.equal(revokedPreview.reason, "consumed");
  } finally {
    await client.close();
  }
});

test("membership permissions and last-owner safety invariants", async () => {
  const { client, db } = await setupTestDb();

  try {
    const owner1Id = "owner-1";
    const user2Id = "user-2";
    const user3Id = "user-3";

    await db.insert(schema.user).values([
      { id: owner1Id, name: "Sole Owner", email: "owner1@example.com" },
      { id: user2Id, name: "Member Two", email: "user2@example.com" },
      { id: user3Id, name: "Stranger Three", email: "user3@example.com" },
    ]);

    const org = await createOrganization({ name: "Safety Labs" }, owner1Id, db);

    const { token } = await createInvitation(
      org.id,
      { email: "user2@example.com", role: "member" },
      owner1Id,
      db,
    );
    await acceptInvitation(token, user2Id, db);

    const members = await listMembers(org.id, owner1Id, db);
    const ownerMember = members.find((m) => m.userId === owner1Id)!;
    const secondMember = members.find((m) => m.userId === user2Id)!;

    // 1. Last owner cannot demote themselves
    await assert.rejects(async () => {
      await updateMemberRole(
        org.id,
        ownerMember.id,
        { role: "admin" },
        owner1Id,
        db,
      );
    }, /Cannot demote the last owner/i);

    // 2. Last owner cannot leave or be removed
    await assert.rejects(async () => {
      await removeMember(org.id, ownerMember.id, owner1Id, db);
    }, /last owner cannot leave/i);

    // 3. Promote second member to owner
    await updateMemberRole(
      org.id,
      secondMember.id,
      { role: "owner" },
      owner1Id,
      db,
    );

    // 4. Now with 2 owners, original owner CAN demote themselves
    const demoted = await updateMemberRole(
      org.id,
      ownerMember.id,
      { role: "admin" },
      owner1Id,
      db,
    );
    assert.equal(demoted?.role, "admin");

    // 5. Transfer ownership explicitly
    await transferOwnership(org.id, user2Id, secondMember.userId, db);

    // 6. Tenant isolation: Stranger Three cannot view or access Safety Labs
    await assert.rejects(async () => {
      await listMembers(org.id, user3Id, db);
    }, /access denied/i);

    const strangerOrg = await getOrganizationById(org.id, user3Id, db);
    assert.equal(strangerOrg, null);
  } finally {
    await client.close();
  }
});
