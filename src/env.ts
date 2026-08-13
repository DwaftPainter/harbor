import { z } from "zod";

const serverEnvSchema = z
  .object({
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_API_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1).optional(),
    AUTH_EMAIL_FROM: z.string().min(1).optional(),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    APP_VERSION: z.string().min(1).default("development"),
  })
  .superRefine((env, context) => {
    if (Boolean(env.RESEND_API_KEY) !== Boolean(env.AUTH_EMAIL_FROM)) {
      context.addIssue({
        code: "custom",
        message:
          "RESEND_API_KEY and AUTH_EMAIL_FROM must be configured together",
        path: [env.RESEND_API_KEY ? "AUTH_EMAIL_FROM" : "RESEND_API_KEY"],
      });
    }

    if (
      Boolean(env.UPSTASH_REDIS_REST_URL) !==
      Boolean(env.UPSTASH_REDIS_REST_TOKEN)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured together",
        path: [
          env.UPSTASH_REDIS_REST_URL
            ? "UPSTASH_REDIS_REST_TOKEN"
            : "UPSTASH_REDIS_REST_URL",
        ],
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = serverEnvSchema.safeParse(process.env);

  if (!parsedEnv.success) {
    const invalidKeys = parsedEnv.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");

    throw new Error(`Invalid server environment keys: ${invalidKeys}`);
  }

  cachedEnv = parsedEnv.data;
  return cachedEnv;
}
