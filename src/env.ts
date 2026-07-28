import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  APP_VERSION: z.string().min(1).default("development"),
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
