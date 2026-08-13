import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Better Auth is mounted on the documented Node.js route", async () => {
  const route = await readSource("src/app/api/auth/[...all]/route.ts");
  const authConfig = await readSource("src/lib/auth.ts");

  assert.match(route, /runtime = "nodejs"/);
  assert.match(route, /toNextJsHandler\(handleAuthRequest\)/);
  assert.match(route, /getAuth\(\)\.handler\(request\)/);
  assert.match(route, /\{ GET, POST, PATCH, PUT, DELETE \}/);
  assert.match(authConfig, /basePath: "\/api\/auth"/);
  assert.match(authConfig, /logger:\s*\{\s*disabled: true/s);
});

test("the initial password, session, and linking policies stay explicit", async () => {
  const authConfig = await readSource("src/lib/auth.ts");

  assert.match(authConfig, /minPasswordLength: 12/);
  assert.match(authConfig, /maxPasswordLength: 128/);
  assert.match(authConfig, /revokeSessionsOnPasswordReset: true/);
  assert.match(authConfig, /accountLinking:\s*\{\s*enabled: false/s);
  assert.match(authConfig, /expiresIn: 60 \* 60 \* 24 \* 7/);
  assert.match(authConfig, /freshAge: 60 \* 10/);
  assert.match(authConfig, /storeSessionInDatabase: true/);
  assert.match(authConfig, /verification:\s*\{\s*storeInDatabase: true/s);
});

test("the Better Auth dashboard plugin requires its server API key", async () => {
  const authConfig = await readSource("src/lib/auth.ts");
  const envConfig = await readSource("src/env.ts");

  assert.match(authConfig, /import \{ dash \} from "@better-auth\/infra"/);
  assert.match(authConfig, /dash\(\{\s*apiKey: env\.BETTER_AUTH_API_KEY/s);
  assert.match(envConfig, /BETTER_AUTH_API_KEY: z\.string\(\)\.min\(1\)/);
});

test("verification and password recovery use server-only email delivery", async () => {
  const authConfig = await readSource("src/lib/auth.ts");
  const emailDelivery = await readSource(
    "src/features/auth/server/email-delivery.ts",
  );
  const envConfig = await readSource("src/env.ts");

  assert.match(authConfig, /requireEmailVerification: true/);
  assert.match(authConfig, /sendResetPassword:/);
  assert.match(authConfig, /sendVerificationEmail:/);
  assert.match(authConfig, /sendOnSignUp: true/);
  assert.match(authConfig, /expiresIn: 60 \* 60/);
  assert.match(emailDelivery, /import "server-only"/);
  assert.match(emailDelivery, /new Resend\(env\.RESEND_API_KEY\)/);
  assert.match(envConfig, /RESEND_API_KEY/);
  assert.match(envConfig, /AUTH_EMAIL_FROM/);
});

test("auth rate limits use shared Upstash secondary storage", async () => {
  const authConfig = await readSource("src/lib/auth.ts");
  const storage = await readSource(
    "src/features/auth/server/rate-limit-storage.ts",
  );
  const envConfig = await readSource("src/env.ts");

  assert.match(authConfig, /secondaryStorage: createRateLimitStorage\(\)/);
  assert.match(authConfig, /storage: "secondary-storage"/);
  assert.match(storage, /import "server-only"/);
  assert.match(storage, /new Redis\(/);
  assert.match(storage, /async set\(key, value, ttl\)/);
  assert.match(storage, /\{ ex: ttl \}/);
  assert.match(storage, /async getAndDelete\(key\)/);
  assert.match(storage, /\.getdel<unknown>/);
  assert.match(envConfig, /UPSTASH_REDIS_REST_URL/);
  assert.match(envConfig, /UPSTASH_REDIS_REST_TOKEN/);
});

test("password recovery has enumeration-safe request and single-use reset UI", async () => {
  const requestPage = await readSource(
    "src/app/(auth)/forgot-password/page.tsx",
  );
  const resetPage = await readSource("src/app/(auth)/reset-password/page.tsx");
  const recoveryForm = await readSource(
    "src/features/auth/components/password-recovery-form.tsx",
  );

  assert.match(requestPage, /<PasswordRecoveryForm mode="request"/);
  assert.match(resetPage, /await searchParams/);
  assert.match(
    resetPage,
    /token=\{typeof token === "string" \? token : undefined\}/,
  );
  assert.match(recoveryForm, /authClient\.requestPasswordReset\(/);
  assert.match(recoveryForm, /redirectTo: "\/reset-password"/);
  assert.match(recoveryForm, /authClient\.resetPassword\(/);
  assert.match(recoveryForm, /If an account exists for that email/);
  assert.match(recoveryForm, /password !== confirmation/);
});

test("auth security telemetry records outcomes without credential material", async () => {
  const route = await readSource("src/app/api/auth/[...all]/route.ts");
  const telemetry = await readSource(
    "src/features/auth/server/auth-telemetry.ts",
  );

  assert.match(route, /recordAuthOutcome\(/);
  assert.match(route, /status: response\.status/);
  assert.match(telemetry, /"auth\.sign_in"/);
  assert.match(telemetry, /"auth\.password_reset"/);
  assert.match(telemetry, /"auth\.session_revocation"/);
  assert.doesNotMatch(telemetry, /user\.email|request\.headers|request\.body/);
  assert.doesNotMatch(route, /request\.(json|text|formData)\(/);
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

test("account settings let users review and selectively revoke sessions", async () => {
  const settingsPage = await readSource(
    "src/app/(dashboard)/settings/page.tsx",
  );
  const sessionManager = await readSource(
    "src/features/auth/components/session-manager.tsx",
  );

  assert.match(
    settingsPage,
    /<SessionManager currentSessionId=\{session\.session\.id\} \/>/,
  );
  assert.match(sessionManager, /authClient\.listSessions\(\)/);
  assert.match(sessionManager, /authClient\.revokeSession\(\{\s*token\s*\}\)/s);
  assert.match(sessionManager, /session\.id === currentSessionId/);
  assert.match(sessionManager, /Loading active sessions/);
  assert.match(sessionManager, /Active sessions could not be loaded/);
});
