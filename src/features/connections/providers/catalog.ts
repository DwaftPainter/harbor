import type { ProviderDescriptor, ProviderId } from "../types";

export const PROVIDER_CATALOG: ProviderDescriptor[] = [
  {
    id: "neon",
    name: "Neon",
    category: "database",
    description: "Serverless Postgres with autoscaling and instant branching.",
    icon: "database",
    authType: "api_key",
    requiredScopes: ["read:projects", "read:branches", "read:endpoints"],
    docUrl: "https://neon.tech/docs/reference/api-reference",
    status: "supported",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "neon_api_key_...",
        helpText:
          "Create a read-only or standard API key in Neon Account Settings > Developer Settings.",
        required: true,
      },
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "compute",
    description:
      "Frontend cloud platform for static and serverless deployments.",
    icon: "globe",
    authType: "bearer_token",
    requiredScopes: ["read:projects", "read:deployments"],
    docUrl: "https://vercel.com/docs/rest-api",
    status: "supported",
    fields: [
      {
        key: "token",
        label: "Access Token",
        type: "password",
        placeholder: "vercel_token_...",
        helpText:
          "Generate an access token in Vercel Account Settings > Tokens.",
        required: true,
      },
      {
        key: "teamId",
        label: "Team ID (Optional)",
        type: "text",
        placeholder: "team_...",
        helpText: "Leave blank if connecting your personal Vercel account.",
        required: false,
      },
    ],
  },
  {
    id: "render",
    name: "Render",
    category: "fullstack",
    description:
      "Unified cloud to build and run web services, databases, and cron jobs.",
    icon: "server",
    authType: "api_key",
    requiredScopes: ["read:services", "read:deploys"],
    docUrl: "https://render.com/docs/api",
    status: "supported",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "rnd_...",
        helpText: "Generate an API Key in Render Account Settings > API Keys.",
        required: true,
      },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "database",
    description: "Open source Firebase alternative built on PostgreSQL.",
    icon: "database",
    authType: "bearer_token",
    requiredScopes: ["read:projects", "read:databases"],
    docUrl: "https://supabase.com/docs/reference/api",
    status: "preview",
    fields: [
      {
        key: "accessToken",
        label: "Personal Access Token",
        type: "password",
        placeholder: "sbp_...",
        helpText:
          "Generate a Personal Access Token in Supabase Account Settings.",
        required: true,
      },
    ],
  },
  {
    id: "railway",
    name: "Railway",
    category: "compute",
    description:
      "Infrastructure platform for deploying web apps and databases.",
    icon: "server",
    authType: "api_key",
    requiredScopes: ["read:projects", "read:deployments"],
    docUrl: "https://docs.railway.com",
    status: "preview",
    fields: [
      {
        key: "apiToken",
        label: "API Token",
        type: "password",
        placeholder: "railway_token_...",
        helpText: "Generate an API token in Railway Account Settings.",
        required: true,
      },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "edge",
    description: "Global CDN, edge compute workers, and DNS routing.",
    icon: "shield",
    authType: "api_key",
    requiredScopes: ["read:workers", "read:pages"],
    docUrl: "https://developers.cloudflare.com/api",
    status: "coming_soon",
    fields: [
      {
        key: "apiToken",
        label: "API Token",
        type: "password",
        placeholder: "cf_token_...",
        helpText: "Create a scoped API Token in Cloudflare User Profile.",
        required: true,
      },
    ],
  },
];

export function getProviderDescriptor(
  providerId: ProviderId,
): ProviderDescriptor | undefined {
  return PROVIDER_CATALOG.find((p) => p.id === providerId);
}
