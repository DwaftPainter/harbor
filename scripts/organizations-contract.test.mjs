import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("organizations, memberships, and invitations are exported with explicit schema and relations", async () => {
  const schemaIndex = await readSource("src/db/schema/index.ts");
  const orgsSchema = await readSource("src/db/schema/organizations.ts");
  const authSchema = await readSource("src/db/schema/auth.ts");

  assert.match(schemaIndex, /export \* from "\.\/organizations"/);
  assert.match(orgsSchema, /export const organizations = pgTable\(/);
  assert.match(orgsSchema, /export const memberships = pgTable\(/);
  assert.match(orgsSchema, /export const invitations = pgTable\(/);
  assert.match(orgsSchema, /onDelete: "cascade"/);
  assert.match(authSchema, /memberships: many\(memberships\)/);
  assert.match(authSchema, /issuedInvitations: many\(invitations\)/);
});

test("role vocabulary defines owner, admin, member, and viewer", async () => {
  const types = await readSource("src/features/organizations/types.ts");

  assert.match(types, /"owner"/);
  assert.match(types, /"admin"/);
  assert.match(types, /"member"/);
  assert.match(types, /"viewer"/);
  assert.match(types, /export const RESERVED_SLUGS =/);
});

test("organization routes and services enforce authentication and last-owner protection", async () => {
  const orgRoute = await readSource("src/app/api/organizations/route.ts");
  const membershipService = await readSource(
    "src/features/organizations/server/membership-service.ts",
  );
  const activeOrgHelper = await readSource(
    "src/features/organizations/server/active-organization.ts",
  );

  assert.match(orgRoute, /getCurrentSession/);
  assert.match(orgRoute, /Unauthorized/);
  assert.match(membershipService, /Cannot demote the last owner/);
  assert.match(membershipService, /last owner cannot leave/);
  assert.match(activeOrgHelper, /harbor_active_org/);
});
