import { z } from "zod";

export const PROVIDER_IDS = [
  "neon",
  "vercel",
  "render",
  "supabase",
  "railway",
  "cloudflare",
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export const CONNECTION_STATUSES = [
  "connected",
  "validating",
  "degraded",
  "revoked",
  "disabled",
] as const;

export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export interface ProviderField {
  key: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
  helpText?: string;
  required?: boolean;
}

export interface ProviderDescriptor {
  id: ProviderId;
  name: string;
  category: "database" | "compute" | "edge" | "fullstack";
  description: string;
  icon: string;
  authType: "api_key" | "bearer_token" | "oauth";
  requiredScopes: string[];
  docUrl: string;
  fields: ProviderField[];
  status: "supported" | "preview" | "coming_soon";
}

export interface ValidationResult {
  valid: boolean;
  externalAccountId?: string;
  externalAccountName?: string;
  scopes?: string[];
  error?: string;
}

export const createConnectionSchema = z.object({
  providerId: z.enum(PROVIDER_IDS),
  name: z.string().trim().min(2).max(64),
  credentials: z
    .record(z.string(), z.unknown())
    .refine((creds) => Object.keys(creds).length > 0, {
      message: "At least one credential field is required",
    }),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;

export const rotateConnectionSchema = z.object({
  credentials: z
    .record(z.string(), z.unknown())
    .refine((creds) => Object.keys(creds).length > 0, {
      message: "At least one credential field is required",
    }),
});

export type RotateConnectionInput = z.infer<typeof rotateConnectionSchema>;

export interface ProviderConnectionDTO {
  id: string;
  organizationId: string;
  providerId: ProviderId;
  name: string;
  status: ConnectionStatus;
  externalAccountId: string | null;
  externalAccountName: string | null;
  scope: string | null;
  fingerprint?: string;
  lastValidatedAt: string | null;
  lastSyncAt: string | null;
  errorSummary: string | null;
  createdAt: string;
  updatedAt: string;
}
