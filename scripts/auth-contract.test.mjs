import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Better Auth is mounted on the documented Node.js route", async () => {
  const route = await readSource("src/app/api/auth/[...all]/route.ts");
  const authConfig = await readSource("src/lib/auth.ts");

  assert.match(route, /runtime = "nodejs"/);
  assert.match(route, /toNextJsHandler\(\(request\) =>/);
  assert.match(route, /getAuth\(\)\.handler\(request\)/);
  assert.match(route, /\{ GET, POST, PATCH, PUT, DELETE \}/);
  assert.match(authConfig, /basePath: "\/api\/auth"/);
});

test("the initial password, session, and linking policies stay explicit", async () => {
  const authConfig = await readSource("src/lib/auth.ts");

  assert.match(authConfig, /minPasswordLength: 12/);
  assert.match(authConfig, /maxPasswordLength: 128/);
  assert.match(authConfig, /revokeSessionsOnPasswordReset: true/);
  assert.match(authConfig, /accountLinking:\s*\{\s*enabled: false/s);
  assert.match(authConfig, /expiresIn: 60 \* 60 \* 24 \* 7/);
  assert.match(authConfig, /freshAge: 60 \* 10/);
});

test("dashboard routes fail closed without an authoritative session", async () => {
  const layout = await readSource("src/app/(dashboard)/layout.tsx");
  const sessionResolver = await readSource(
    "src/features/auth/server/session.ts",
  );

  assert.match(layout, /await getCurrentSession\(\)/);
  assert.match(layout, /if \(!session\)/);
  assert.match(layout, /redirect\("\/sign-in"\)/);
  assert.match(sessionResolver, /await connection\(\)/);
  assert.match(sessionResolver, /getAuth\(\)\.api\.getSession/);
});
