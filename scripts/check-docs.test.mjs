import assert from "node:assert/strict";
import test from "node:test";

import {
  extractLocalLinks,
  validateDocumentMetadata,
  validateRequiredSections,
} from "./check-docs.mjs";

test("extractLocalLinks ignores remote and anchor-only links", () => {
  const content = [
    "[local](../guide.md)",
    "[section](#section)",
    "[remote](https://example.com/docs)",
    "[with anchor](./feature.md#acceptance)",
  ].join("\n");

  assert.deepEqual(extractLocalLinks(content), ["../guide.md", "./feature.md"]);
});

test("validateDocumentMetadata accepts documented lifecycle states", () => {
  assert.deepEqual(
    validateDocumentMetadata("example.md", "# Example\n\nStatus: Approved\n"),
    [],
  );
});

test("validateDocumentMetadata reports missing metadata", () => {
  assert.deepEqual(validateDocumentMetadata("example.md", "Body only"), [
    "example.md: missing level-one title",
    "example.md: missing Status metadata",
  ]);
});

test("feature template requires security, testing, and operations sections", () => {
  const errors = validateRequiredSections(
    "features/TEMPLATE.md",
    "## Purpose\n## Responsibilities\n",
  );

  assert.ok(
    errors.includes(
      'features/TEMPLATE.md: missing required section "Security"',
    ),
  );
  assert.ok(
    errors.includes('features/TEMPLATE.md: missing required section "Testing"'),
  );
  assert.ok(
    errors.includes(
      'features/TEMPLATE.md: missing required section "Operations"',
    ),
  );
});
