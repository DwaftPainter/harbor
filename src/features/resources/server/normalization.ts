import type { NormalizedResourceStatus } from "../types";

const SENSITIVE_KEY_PATTERN =
  /(key|token|secret|auth|password|credential|cert|private|signature|bearer)/i;

/**
 * Pure mapping from provider-native raw status into normalized platform status.
 */
export function normalizeResourceStatus(
  providerId: string,
  rawStatus: string | null | undefined,
): NormalizedResourceStatus {
  if (!rawStatus) return "unknown";

  const s = rawStatus.trim().toLowerCase();

  switch (providerId) {
    case "neon":
      if (s === "ready" || s === "active") return "running";
      if (s === "init" || s === "creating") return "provisioning";
      if (s === "disabled" || s === "paused" || s === "idle") return "stopped";
      if (s === "error" || s === "failed") return "error";
      break;

    case "vercel":
      if (s === "ready" || s === "active") return "running";
      if (s === "building" || s === "initializing" || s === "queued")
        return "provisioning";
      if (s === "error" || s === "canceled") return "error";
      if (s === "archived") return "stopped";
      break;

    case "render":
      if (s === "live" || s === "available" || s === "active") return "running";
      if (s === "build_in_progress" || s === "deploying" || s === "creating")
        return "provisioning";
      if (s === "suspended" || s === "deprovisioned") return "stopped";
      if (s === "build_failed" || s === "degraded" || s === "failed")
        return "error";
      break;

    default:
      if (
        s === "ready" ||
        s === "running" ||
        s === "active" ||
        s === "live" ||
        s === "healthy"
      )
        return "running";
      if (s === "stopped" || s === "suspended" || s === "paused")
        return "stopped";
      if (s === "provisioning" || s === "building" || s === "pending")
        return "provisioning";
      if (s === "degraded") return "degraded";
      if (s === "error" || s === "failed" || s === "unhealthy") return "error";
      break;
  }

  return "unknown";
}

/**
 * Sanitizes arbitrary provider metadata:
 * - Recursively redacts sensitive keys
 * - Enforces a maximum 32KB JSON string length
 */
export function sanitizeResourceMetadata(
  metadata: unknown,
  maxBytes = 32768,
): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  function scrub(value: unknown): unknown {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(scrub);
    }

    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(k)) {
        cleaned[k] = "[REDACTED]";
      } else {
        cleaned[k] = scrub(v);
      }
    }
    return cleaned;
  }

  const scrubbed = scrub(metadata) as Record<string, unknown>;
  const serialized = JSON.stringify(scrubbed);

  if (Buffer.byteLength(serialized, "utf8") > maxBytes) {
    return {
      _warning:
        "Metadata exceeded maximum allowed size of 32KB and was truncated",
    };
  }

  return scrubbed;
}

/**
 * Encodes an opaque, deterministic cursor using (createdAt, id).
 */
export function encodeCursor(createdAt: Date, id: string): string {
  const payload = JSON.stringify({ t: createdAt.toISOString(), id });
  return Buffer.from(payload, "utf8").toString("base64url");
}

/**
 * Decodes an opaque cursor string back into (createdAt, id).
 */
export function decodeCursor(
  cursor: string,
): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as { t?: string; id?: string };
    if (!parsed.t || !parsed.id) return null;

    const createdAt = new Date(parsed.t);
    if (isNaN(createdAt.getTime())) return null;

    return { createdAt, id: parsed.id };
  } catch {
    return null;
  }
}
