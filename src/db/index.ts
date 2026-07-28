import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getServerEnv } from "@/env";

import * as schema from "./schema";

function createDatabase() {
  const client = neon(getServerEnv().DATABASE_URL);

  return drizzle({
    client,
    schema,
  });
}

export type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

export function getDb(): Database {
  database ??= createDatabase();
  return database;
}
