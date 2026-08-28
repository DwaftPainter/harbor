import assert from "node:assert/strict";
import test from "node:test";

import {
  ERROR_CATEGORIES,
  queueSyncSchema,
  RESOURCE_KINDS,
  SYNC_CAPABILITIES,
  SYNC_STATUSES,
  SYNC_TRIGGERS,
} from "../src/features/sync/types.ts";

test("sync vocabulary and state machine status completeness", () => {
  assert.deepEqual(
    [...SYNC_STATUSES].sort(),
    [
      "cancelled",
      "failed",
      "partially_succeeded",
      "queued",
      "running",
      "succeeded",
    ].sort(),
  );

  assert.deepEqual(
    [...SYNC_TRIGGERS].sort(),
    ["manual", "scheduled", "webhook"].sort(),
  );

  assert.ok(SYNC_CAPABILITIES.includes("full"));
  assert.ok(SYNC_CAPABILITIES.includes("projects"));
  assert.ok(SYNC_CAPABILITIES.includes("deployments"));
  assert.ok(SYNC_CAPABILITIES.includes("databases"));

  assert.deepEqual(
    [...RESOURCE_KINDS].sort(),
    ["database", "deployment", "project", "service"].sort(),
  );

  assert.deepEqual(
    [...ERROR_CATEGORIES].sort(),
    ["auth", "fatal", "rate_limit", "schema", "timeout", "transient"].sort(),
  );
});

test("queueSyncSchema default parsing and validation", () => {
  const defaultParsed = queueSyncSchema.parse({});
  assert.equal(defaultParsed.capability, "full");
  assert.equal(defaultParsed.trigger, "manual");

  const customParsed = queueSyncSchema.parse({
    capability: "databases",
    trigger: "scheduled",
  });
  assert.equal(customParsed.capability, "databases");
  assert.equal(customParsed.trigger, "scheduled");

  // Invalid capability rejected
  const invalidCap = queueSyncSchema.safeParse({ capability: "unknown" });
  assert.equal(invalidCap.success, false);
});
