import { z } from "zod";

import type { ExternalResourceDTO } from "@/features/resources/types";

export const ENVIRONMENT_CLASSIFICATIONS = [
  "production",
  "staging",
  "preview",
  "development",
  "custom",
] as const;

export type EnvironmentClassification =
  (typeof ENVIRONMENT_CLASSIFICATIONS)[number];

export const BINDING_SOURCES = [
  "manual",
  "suggested",
  "auto_inferred",
] as const;

export type BindingSource = (typeof BINDING_SOURCES)[number];

export const DEFAULT_ENVIRONMENTS: ReadonlyArray<{
  name: string;
  slug: string;
  classification: EnvironmentClassification;
  isProduction: boolean;
  orderIndex: number;
}> = [
  {
    name: "Production",
    slug: "production",
    classification: "production",
    isProduction: true,
    orderIndex: 0,
  },
  {
    name: "Staging",
    slug: "staging",
    classification: "staging",
    isProduction: false,
    orderIndex: 1,
  },
  {
    name: "Development",
    slug: "development",
    classification: "development",
    isProduction: false,
    orderIndex: 2,
  },
];

// Zod validation schemas
export const createApplicationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be <= 100 characters"),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    )
    .optional(),
  description: z
    .string()
    .max(500, "Description must be <= 500 characters")
    .optional(),
  defaultEnvironments: z.boolean().default(true),
});

export type CreateApplicationInput = z.input<typeof createApplicationSchema>;

export const updateApplicationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const createEnvironmentSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be <= 50 characters"),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    )
    .optional(),
  classification: z.enum(ENVIRONMENT_CLASSIFICATIONS).default("custom"),
  isProduction: z.boolean().default(false),
  orderIndex: z.number().int().min(0).optional(),
});

export type CreateEnvironmentInput = z.input<typeof createEnvironmentSchema>;

export const updateEnvironmentSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  classification: z.enum(ENVIRONMENT_CLASSIFICATIONS).optional(),
  isProduction: z.boolean().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;

export const bindResourceSchema = z.object({
  environmentId: z.string().min(1, "Environment ID is required"),
  resourceId: z.string().min(1, "Resource ID is required"),
  isPrimary: z.boolean().default(false),
  bindingSource: z.enum(BINDING_SOURCES).default("manual"),
});

export type BindResourceInput = z.input<typeof bindResourceSchema>;

// DTO interfaces
export interface ApplicationDTO {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentDTO {
  id: string;
  organizationId: string;
  applicationId: string;
  name: string;
  slug: string;
  classification: EnvironmentClassification;
  isProduction: boolean;
  orderIndex: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceBindingDTO {
  id: string;
  organizationId: string;
  applicationId: string;
  environmentId: string;
  resourceId: string;
  bindingSource: BindingSource;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  resource?: ExternalResourceDTO;
  environment?: EnvironmentDTO;
}

export interface ApplicationDetailDTO extends ApplicationDTO {
  environments: EnvironmentDTO[];
  boundResourceCount: number;
}

export interface BindingSuggestionDTO {
  resourceId: string;
  suggestedEnvironmentSlug: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  resource: ExternalResourceDTO;
}
