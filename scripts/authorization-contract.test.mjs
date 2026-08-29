import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeMetadata } from "../src/features/audit/server/audit-service.ts";
import {
  hasPermission,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "../src/features/authorization/permissions.ts";

test("permission vocabulary and role matrix completeness", () => {
  assert.ok(PERMISSIONS.length >= 15, "Expected comprehensive permission set");
  assert.ok(
    PERMISSIONS.includes("organization:read"),
    "organization:read must exist",
  );
  assert.ok(
    PERMISSIONS.includes("organization:delete"),
    "organization:delete must exist",
  );
  assert.ok(
    PERMISSIONS.includes("ownership:transfer"),
    "ownership:transfer must exist",
  );
  assert.ok(PERMISSIONS.includes("member:invite"), "member:invite must exist");
  assert.ok(PERMISSIONS.includes("audit:read"), "audit:read must exist");
  assert.ok(
    PERMISSIONS.includes("connection:sync"),
    "connection:sync must exist",
  );

  const roles = Object.keys(ROLE_PERMISSIONS);
  assert.deepEqual(
    roles.sort(),
    ["admin", "member", "owner", "viewer"].sort(),
    "Exact role set must be owner, admin, member, viewer",
  );

  // Owner possesses strictly all permissions
  for (const perm of PERMISSIONS) {
    assert.equal(
      hasPermission("owner", perm),
      true,
      `Owner must have permission: ${perm}`,
    );
  }

  // Admin lacks ownership:transfer and organization:delete
  assert.equal(hasPermission("admin", "organization:delete"), false);
  assert.equal(hasPermission("admin", "ownership:transfer"), false);
  assert.equal(hasPermission("admin", "member:invite"), true);
  assert.equal(hasPermission("admin", "audit:read"), true);

  // Member lacks administrative and audit permissions
  assert.equal(hasPermission("member", "audit:read"), false);
  assert.equal(hasPermission("member", "member:invite"), false);
  assert.equal(hasPermission("member", "organization:update"), false);
  assert.equal(hasPermission("member", "application:create"), true);

  // Viewer is strictly read-only
  for (const grant of ROLE_PERMISSIONS.viewer) {
    assert.ok(
      grant.endsWith(":read"),
      `Viewer grant ${grant} must be a :read permission`,
    );
  }
  assert.equal(hasPermission("viewer", "application:create"), false);
  assert.equal(hasPermission("viewer", "member:update"), false);
  assert.equal(hasPermission("viewer", "audit:read"), false);
});

test("deny-by-default on invalid or unknown roles and permissions", () => {
  // @ts-expect-error test unknown role
  assert.equal(hasPermission("superadmin", "organization:read"), false);
  // @ts-expect-error test empty role
  assert.equal(hasPermission("", "organization:read"), false);
  assert.equal(hasPermission(null, "organization:read"), false);
  assert.equal(hasPermission(undefined, "organization:read"), false);

  // @ts-expect-error test unknown permission
  assert.equal(hasPermission("owner", "unknown:permission"), false);
});

test("sanitizeMetadata deep recursive secret redaction", () => {
  const payload = {
    organizationName: "Acme",
    settings: {
      theme: "dark",
      apiToken: "super-secret-token-123",
      nested: {
        password: "my-cleartext-password",
        secretKey: "key_987654321",
        publicId: "pub_12345",
      },
    },
    credentialsList: [
      { id: 1, apiKey: "ak_live_xyz", label: "Production Key" },
      { id: 2, authorization: "Bearer eyJhbGci...", label: "Auth Token" },
    ],
  };

  const sanitized = sanitizeMetadata(payload);

  assert.equal(sanitized.organizationName, "Acme");
  assert.equal(sanitized.settings.theme, "dark");
  assert.equal(sanitized.settings.apiToken, "[REDACTED]");
  assert.equal(sanitized.settings.nested.password, "[REDACTED]");
  assert.equal(sanitized.settings.nested.secretKey, "[REDACTED]");
  assert.equal(sanitized.settings.nested.publicId, "pub_12345");
  assert.equal(sanitized.credentialsList[0].apiKey, "[REDACTED]");
  assert.equal(sanitized.credentialsList[0].label, "Production Key");
  assert.equal(sanitized.credentialsList[1].authorization, "[REDACTED]");
});
