import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { setTimeout } from "node:timers/promises";

import { PGlite } from "@electric-sql/pglite";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "../src/db/schema/index";

const origin = "http://harbor.test";

interface SentEmail {
  kind: "reset" | "verification";
  to: string;
  url: string;
}

function jsonRequest(path: string, body: Record<string, unknown>) {
  return new Request(`${origin}/api/auth${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function cookieFrom(response: Response) {
  return response.headers.get("set-cookie")?.split(";", 1)[0];
}

test("verification is idempotent while recovery is single-use and revokes sessions", async () => {
  const client = new PGlite();
  const migration = await readFile(
    new URL(
      "../src/db/migrations/0000_mature_the_santerians.sql",
      import.meta.url,
    ),
    "utf8",
  );

  try {
    for (const statement of migration.split("--> statement-breakpoint")) {
      if (statement.trim()) {
        await client.exec(statement);
      }
    }

    const sentEmails: SentEmail[] = [];
    const database = drizzle(client, { schema });
    const auth = betterAuth({
      baseURL: origin,
      basePath: "/api/auth",
      secret: "test-secret-that-is-at-least-thirty-two-characters",
      logger: { disabled: true },
      database: drizzleAdapter(database, { provider: "pg", schema }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 12,
        maxPasswordLength: 128,
        resetPasswordTokenExpiresIn: 1,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
          sentEmails.push({ kind: "reset", to: user.email, url });
        },
      },
      emailVerification: {
        expiresIn: 60 * 60,
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
          sentEmails.push({ kind: "verification", to: user.email, url });
        },
      },
      rateLimit: { enabled: false },
    });

    const email = "verified@example.com";
    const password = "correct-horse-battery-staple";
    const signUp = await auth.handler(
      jsonRequest("/sign-up/email", {
        name: "Verified User",
        email,
        password,
        callbackURL: "/",
      }),
    );

    assert.equal(signUp.status, 200);
    assert.equal(sentEmails.length, 1);
    assert.equal(sentEmails[0]?.kind, "verification");

    const verification = await auth.handler(
      new Request(sentEmails[0]!.url, { redirect: "manual" }),
    );
    assert.equal(verification.status, 302);

    const verificationReplay = await auth.handler(
      new Request(sentEmails[0]!.url, { redirect: "manual" }),
    );
    assert.equal(verificationReplay.status, 302);
    assert.equal(verificationReplay.headers.get("location"), "/");

    const signIn = await auth.handler(
      jsonRequest("/sign-in/email", { email, password }),
    );
    assert.equal(signIn.status, 200);
    const sessionCookie = cookieFrom(signIn);
    assert.ok(sessionCookie);

    const unknownReset = await auth.handler(
      jsonRequest("/request-password-reset", {
        email: "missing@example.com",
        redirectTo: "/reset-password",
      }),
    );
    const unknownBody = await unknownReset.json();
    assert.equal(sentEmails.length, 1);

    const knownReset = await auth.handler(
      jsonRequest("/request-password-reset", {
        email,
        redirectTo: "/reset-password",
      }),
    );
    const knownBody = await knownReset.json();
    assert.deepEqual(knownBody, unknownBody);
    assert.equal(sentEmails.length, 2);
    assert.equal(sentEmails[1]?.kind, "reset");

    const resetUrl = new URL(sentEmails[1]!.url);
    const resetToken = resetUrl.pathname.split("/").at(-1);
    assert.ok(resetToken);

    const newPassword = "new-correct-horse-battery-staple";
    const reset = await auth.handler(
      jsonRequest("/reset-password", { newPassword, token: resetToken }),
    );
    assert.equal(reset.status, 200);

    const replay = await auth.handler(
      jsonRequest("/reset-password", { newPassword, token: resetToken }),
    );
    assert.equal(replay.status, 400);

    await auth.handler(
      jsonRequest("/request-password-reset", {
        email,
        redirectTo: "/reset-password",
      }),
    );
    const expiredUrl = new URL(sentEmails.at(-1)!.url);
    const expiredToken = expiredUrl.pathname.split("/").at(-1);
    assert.ok(expiredToken);
    await setTimeout(1_100);

    const expiredReset = await auth.handler(
      jsonRequest("/reset-password", {
        newPassword: "another-correct-horse-battery-staple",
        token: expiredToken,
      }),
    );
    assert.equal(expiredReset.status, 400);

    const oldSession = await auth.handler(
      new Request(`${origin}/api/auth/get-session`, {
        headers: { cookie: sessionCookie },
      }),
    );
    assert.equal(await oldSession.json(), null);

    const oldPasswordSignIn = await auth.handler(
      jsonRequest("/sign-in/email", { email, password }),
    );
    assert.equal(oldPasswordSignIn.status, 401);

    const newPasswordSignIn = await auth.handler(
      jsonRequest("/sign-in/email", { email, password: newPassword }),
    );
    assert.equal(newPasswordSignIn.status, 200);
  } finally {
    await client.close();
  }
});
