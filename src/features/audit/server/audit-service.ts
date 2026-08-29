import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { type AppDb, getDb } from "@/db";
import { user } from "@/db/schema/auth";
import { auditEvents } from "@/db/schema/audit";
import {
  type AuditEventWithActor,
  type AuditQueryFilters,
  auditQuerySchema,
  type CreateAuditEventInput,
} from "@/features/audit/types";
import { requirePermission } from "@/features/authorization/server/authorization-service";

const SENSITIVE_KEY_REGEX =
  /token|password|secret|credential|key|apikey|authorization|cookie|session|signature|private/i;

/**
 * Deeply sanitizes metadata objects and arrays, replacing sensitive key values with '[REDACTED]'.
 */
export function sanitizeMetadata(
  value: unknown,
): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  function clean(val: unknown): unknown {
    if (val === null || val === undefined) {
      return val;
    }

    if (Array.isArray(val)) {
      return val.map((item) => clean(item));
    }

    if (typeof val === "object" && !(val instanceof Date)) {
      const sanitizedObj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (
          (typeof v !== "object" || v === null) &&
          SENSITIVE_KEY_REGEX.test(k) &&
          !/public|count|label|name/i.test(k)
        ) {
          sanitizedObj[k] = "[REDACTED]";
        } else {
          sanitizedObj[k] = clean(v);
        }
      }
      return sanitizedObj;
    }

    return val;
  }

  return clean(value) as Record<string, unknown>;
}

export async function recordAuditEvent(
  input: CreateAuditEventInput,
  db: AppDb = getDb(),
) {
  try {
    const id = randomUUID();
    const sanitizedMeta = input.metadata
      ? sanitizeMetadata(input.metadata)
      : null;

    const [event] = await db
      .insert(auditEvents)
      .values({
        id,
        organizationId: input.organizationId,
        actorId: input.actorId || null,
        actorEmail: input.actorEmail || null,
        actorType: input.actorType || "user",
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId || null,
        outcome: input.outcome || "success",
        metadata: sanitizedMeta,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      })
      .returning();

    return event;
  } catch (error) {
    // Audit logging failure should be observable but not crash caller flow
    console.error("Failed to record audit event:", error);
    return null;
  }
}

export async function listAuditEvents(
  organizationId: string,
  actorUserId: string,
  filters: AuditQueryFilters = {},
  db: AppDb = getDb(),
): Promise<{
  events: AuditEventWithActor[];
  total: number;
  limit: number;
  offset: number;
}> {
  // 1. Authorization check
  await requirePermission(organizationId, actorUserId, "audit:read", db);

  const validated = auditQuerySchema.parse(filters);

  // 2. Build filters
  const conditions = [eq(auditEvents.organizationId, organizationId)];

  if (validated.action) {
    conditions.push(eq(auditEvents.action, validated.action));
  }
  if (validated.actorId) {
    conditions.push(eq(auditEvents.actorId, validated.actorId));
  }
  if (validated.targetType) {
    conditions.push(eq(auditEvents.targetType, validated.targetType));
  }
  if (validated.outcome) {
    conditions.push(eq(auditEvents.outcome, validated.outcome));
  }
  if (validated.fromDate) {
    conditions.push(gte(auditEvents.createdAt, new Date(validated.fromDate)));
  }
  if (validated.toDate) {
    conditions.push(lte(auditEvents.createdAt, new Date(validated.toDate)));
  }

  const whereClause = and(...conditions);

  // 3. Count total matching events
  const [totalCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(auditEvents)
    .where(whereClause);

  const total = Number(totalCountResult?.count || 0);

  // 4. Fetch paginated records with actor join
  const rows = await db
    .select({
      id: auditEvents.id,
      organizationId: auditEvents.organizationId,
      actorId: auditEvents.actorId,
      actorEmail: auditEvents.actorEmail,
      actorType: auditEvents.actorType,
      action: auditEvents.action,
      targetType: auditEvents.targetType,
      targetId: auditEvents.targetId,
      outcome: auditEvents.outcome,
      metadata: auditEvents.metadata,
      ipAddress: auditEvents.ipAddress,
      userAgent: auditEvents.userAgent,
      createdAt: auditEvents.createdAt,
      actorName: user.name,
      actorLiveEmail: user.email,
      actorImage: user.image,
    })
    .from(auditEvents)
    .leftJoin(user, eq(auditEvents.actorId, user.id))
    .where(whereClause)
    .orderBy(desc(auditEvents.createdAt))
    .limit(validated.limit)
    .offset(validated.offset);

  const events: AuditEventWithActor[] = rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    actorId: row.actorId,
    actorEmail: row.actorEmail || row.actorLiveEmail || null,
    actorType: row.actorType,
    action: row.action,
    targetType: row.targetType,
    targetId: row.targetId,
    outcome: row.outcome,
    metadata: row.metadata as Record<string, unknown> | null,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
    actor: row.actorId
      ? {
          id: row.actorId,
          name: row.actorName || "Unknown",
          email: row.actorLiveEmail || row.actorEmail || "",
          image: row.actorImage,
        }
      : null,
  }));

  return {
    events,
    total,
    limit: validated.limit,
    offset: validated.offset,
  };
}
