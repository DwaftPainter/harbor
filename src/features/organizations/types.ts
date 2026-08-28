import { z } from "zod";

import type {
  invitations,
  memberships,
  organizations,
} from "@/db/schema/organizations";

export const ORGANIZATION_ROLES = [
  "owner",
  "admin",
  "member",
  "viewer",
] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "auth",
  "dashboard",
  "settings",
  "health",
  "sign-in",
  "sign-up",
  "applications",
  "deployments",
  "connections",
  "organizations",
  "invitations",
  "members",
  "login",
  "register",
  "logout",
  "help",
  "support",
  "billing",
  "account",
] as const;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name cannot exceed 64 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug must be at least 2 characters")
    .max(48, "Slug cannot exceed 48 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase alphanumeric characters and hyphens",
    )
    .refine(
      (slug) =>
        !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]),
      "This slug is reserved and cannot be used",
    )
    .optional(),
});

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name cannot exceed 64 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug must be at least 2 characters")
    .max(48, "Slug cannot exceed 48 characters")
    .regex(
      slugRegex,
      "Slug must contain only lowercase alphanumeric characters and hyphens",
    )
    .refine(
      (slug) =>
        !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]),
      "This slug is reserved and cannot be used",
    )
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  role: z.enum(ORGANIZATION_ROLES),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(ORGANIZATION_ROLES),
});

export const transferOwnershipSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;

export type Organization = typeof organizations.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;

export interface OrganizationMemberWithUser extends Membership {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface UserOrganization extends Organization {
  role: OrganizationRole;
  memberCount: number;
}
