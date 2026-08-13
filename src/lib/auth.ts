import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { getServerEnv } from "@/env";
import { sendAuthEmail } from "@/features/auth/server/email-delivery";
import { createRateLimitStorage } from "@/features/auth/server/rate-limit-storage";

function createAuth() {
  const env = getServerEnv();

  return betterAuth({
    appName: "Harbor",
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    logger: {
      disabled: true,
    },
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({
          action: "Use this secure link to reset your Harbor password.",
          subject: "Reset your Harbor password",
          to: user.email,
          url,
        });
      },
    },
    emailVerification: {
      expiresIn: 60 * 60,
      sendOnSignIn: true,
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail({
          action: "Use this secure link to verify your Harbor email address.",
          subject: "Verify your Harbor email",
          to: user.email,
          url,
        });
      },
    },
    verification: {
      storeInDatabase: true,
    },
    account: {
      accountLinking: {
        enabled: false,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      freshAge: 60 * 10,
      storeSessionInDatabase: true,
    },
    rateLimit: {
      enabled: true,
      storage: "secondary-storage",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": {
          window: 60,
          max: 10,
        },
        "/sign-up/email": {
          window: 60,
          max: 5,
        },
      },
    },
    secondaryStorage: createRateLimitStorage(),
    plugins: [
      dash({
        apiKey: env.BETTER_AUTH_API_KEY,
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let auth: Auth | undefined;

export function getAuth(): Auth {
  auth ??= createAuth();
  return auth;
}
