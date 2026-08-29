import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeCursor,
  encodeCursor,
  normalizeResourceStatus,
  sanitizeResourceMetadata,
} from "../src/features/resources/server/normalization.ts";
import {
  NORMALIZED_STATUSES,
  RELATIONSHIP_TYPES,
  RESOURCE_KINDS,
  resourceFilterSchema,
} from "../src/features/resources/types.ts";

test("resource kinds, normalized statuses, and relationship types completeness", () => {
  assert.deepEqual(
    [...RESOURCE_KINDS].sort(),
    [
      "database",
      "deployment",
      "domain",
      "project",
      "service",
      "storage",
    ].sort(),
  );

  assert.deepEqual(
    [...NORMALIZED_STATUSES].sort(),
    [
      "degraded",
      "error",
      "provisioning",
      "running",
      "stopped",
      "unknown",
    ].sort(),
  );

  assert.deepEqual(
    [...RELATIONSHIP_TYPES].sort(),
    ["depends_on", "deploys_to", "links_to", "parent_of"].sort(),
  );
});

test("normalizeResourceStatus provider mapping", () => {
  // Neon
  assert.equal(normalizeResourceStatus("neon", "ready"), "running");
  assert.equal(normalizeResourceStatus("neon", "active"), "running");
  assert.equal(normalizeResourceStatus("neon", "init"), "provisioning");
  assert.equal(normalizeResourceStatus("neon", "disabled"), "stopped");
  assert.equal(normalizeResourceStatus("neon", "error"), "error");

  // Vercel
  assert.equal(normalizeResourceStatus("vercel", "READY"), "running");
  assert.equal(normalizeResourceStatus("vercel", "BUILDING"), "provisioning");
  assert.equal(normalizeResourceStatus("vercel", "ERROR"), "error");
  assert.equal(normalizeResourceStatus("vercel", "CANCELED"), "error");

  // Render
  assert.equal(normalizeResourceStatus("render", "live"), "running");
  assert.equal(normalizeResourceStatus("render", "available"), "running");
  assert.equal(
    normalizeResourceStatus("render", "build_in_progress"),
    "provisioning",
  );
  assert.equal(normalizeResourceStatus("render", "suspended"), "stopped");

  // Fallbacks
  assert.equal(
    normalizeResourceStatus("unknown_provider", "active"),
    "running",
  );
  assert.equal(
    normalizeResourceStatus("unknown_provider", "unrecognized_xyz"),
    "unknown",
  );
});

test("sanitizeResourceMetadata recursive scrubbing and size bounds", () => {
  const dirty = {
    region: "us-east-1",
    version: 16,
    apiKey: "secret-api-key-12345",
    nested: {
      authToken: "bearer 987654",
      databasePassword: "mypassword",
      host: "db.neon.tech",
    },
    arrayField: [
      { secretCertificate: "-----BEGIN CERT-----", publicName: "prod-cert" },
    ],
  };

  const clean = sanitizeResourceMetadata(dirty);

  assert.equal(clean.region, "us-east-1");
  assert.equal(clean.version, 16);
  assert.equal(clean.apiKey, "[REDACTED]");
  assert.equal(clean.nested.authToken, "[REDACTED]");
  assert.equal(clean.nested.databasePassword, "[REDACTED]");
  assert.equal(clean.nested.host, "db.neon.tech");
  assert.equal(clean.arrayField[0].secretCertificate, "[REDACTED]");
  assert.equal(clean.arrayField[0].publicName, "prod-cert");
});

test("encodeCursor and decodeCursor roundtrip and error safety", () => {
  const timestamp = new Date("2026-08-27T10:00:00.000Z");
  const id = "res_12345_alpha";

  const cursor = encodeCursor(timestamp, id);
  assert.ok(typeof cursor === "string");
  assert.ok(!cursor.includes("="), "Cursor should be url-safe base64");

  const decoded = decodeCursor(cursor);
  assert.ok(decoded);
  assert.equal(decoded.createdAt.toISOString(), timestamp.toISOString());
  assert.equal(decoded.id, id);

  // Tampered or invalid cursor returns null
  assert.equal(decodeCursor("invalid-cursor-string"), null);
  assert.equal(decodeCursor(""), null);
});

test("resourceFilterSchema parsing and defaults", () => {
  const parsedDefault = resourceFilterSchema.parse({});
  assert.equal(parsedDefault.pageSize, 20);

  const parsedCustom = resourceFilterSchema.parse({
    providerId: "neon",
    kind: "database",
    status: "running",
    isStale: "true",
    search: "alpha-prod",
    pageSize: "50",
  });

  assert.equal(parsedCustom.providerId, "neon");
  assert.equal(parsedCustom.kind, "database");
  assert.equal(parsedCustom.status, "running");
  assert.equal(parsedCustom.isStale, true);
  assert.equal(parsedCustom.search, "alpha-prod");
  assert.equal(parsedCustom.pageSize, 50);
});
