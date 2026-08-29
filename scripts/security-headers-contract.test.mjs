import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("CSP permits React development diagnostics without weakening production", async () => {
  const nextConfig = await readFile("next.config.ts", "utf8");

  assert.match(
    nextConfig,
    /const isDevelopment = process\.env\.NODE_ENV === "development";/,
  );
  assert.match(
    nextConfig,
    /script-src 'self' 'unsafe-inline'\$\{\s*isDevelopment\s*\?\s*" 'unsafe-eval'"\s*:\s*""\s*\}/s,
  );
  assert.doesNotMatch(
    nextConfig,
    /["']script-src 'self' 'unsafe-inline' 'unsafe-eval'["']/,
  );
});
