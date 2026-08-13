import "server-only";

import { Redis } from "@upstash/redis";
import type { SecondaryStorage } from "better-auth";

import { getServerEnv } from "@/env";

const KEY_PREFIX = "harbor:auth:";

let redis: Redis | undefined;

function getRedis() {
  if (redis) {
    return redis;
  }

  const env = getServerEnv();

  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "Distributed authentication rate limiting is not configured",
    );
  }

  redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return redis;
}

function storageKey(key: string) {
  return `${KEY_PREFIX}${key}`;
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? value : JSON.stringify(value);
}

export function createRateLimitStorage(): SecondaryStorage {
  return {
    async get(key) {
      return normalizeValue(await getRedis().get<unknown>(storageKey(key)));
    },
    async getAndDelete(key) {
      return normalizeValue(await getRedis().getdel<unknown>(storageKey(key)));
    },
    async set(key, value, ttl) {
      if (ttl) {
        await getRedis().set(storageKey(key), value, { ex: ttl });
        return;
      }

      await getRedis().set(storageKey(key), value);
    },
    async delete(key) {
      await getRedis().del(storageKey(key));
    },
  };
}
