import { z } from "zod";

export const AUDIT_ACTIONS = [
  "organization.created",
  "organization.updated",
  "organization.deleted",
  "member.invited",
  "member.role_updated",
  "member.removed",
  "ownership.transferred",
  "invitation.created",
  "invitation.accepted",
  "invitation.revoked",
  "connection.created",
  "connection.updated",
  "connection.deleted",
  "connection.synced",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number] | string;

export const AUDIT_TARGET_TYPES = [
  "organization",
  "membership",
  "invitation",
  "connection",
  "application",
  "environment",
  "deployment",
  "config",
] as const;

export type AuditTargetType = (typeof AUDIT_TARGET_TYPES)[number] | string;

export const AUDIT_OUTCOMES = ["success", "denied", "error"] as const;
export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];

export interface CreateAuditEventInput {
  organizationId: string;
  actorId?: string | null;
  actorEmail?: string | null;
  actorType?: "user" | "system" | "api_key";
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string | null;
  outcome?: AuditOutcome;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditQueryFilters {
  action?: string;
  actorId?: string;
  targetType?: string;
  outcome?: AuditOutcome;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

export const auditQuerySchema = z.object({
  action: z.string().optional(),
  actorId: z.string().optional(),
  targetType: z.string().optional(),
  outcome: z.enum(["success", "denied", "error"]).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0),
});

export type AuditQueryInput = z.infer<typeof auditQuerySchema>;

export interface AuditEventWithActor {
  id: string;
  organizationId: string;
  actorId: string | null;
  actorEmail: string | null;
  actorType: string;
  action: string;
  targetType: string;
  targetId: string | null;
  outcome: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  actor?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}
