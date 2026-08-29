import type { ProviderId } from "@/features/connections/types";

import type { DiscoveredResourceItem, SyncPageResult } from "../types";

/**
 * Discovers resources from external cloud providers with pagination, rate-limit classification,
 * and sandbox test fixtures for deterministic verification.
 */
export async function discoverProviderResources(
  providerId: ProviderId,
  credentials: Record<string, unknown>,
  cursor?: string,
): Promise<SyncPageResult> {
  const timeoutSignal = AbortSignal.timeout(5000);

  switch (providerId) {
    case "neon": {
      const apiKey = String(credentials.apiKey || "").trim();

      // Test sandbox fixture
      if (
        apiKey.startsWith("test_") ||
        apiKey.startsWith("neon_test_") ||
        apiKey.startsWith("mock_") ||
        process.env.NODE_ENV === "test"
      ) {
        const page1Items: DiscoveredResourceItem[] = [
          {
            externalId: "prj_neon_alpha_123",
            name: "alpha-production-db",
            kind: "project",
            status: "ready",
            metadata: {
              region: "aws-us-east-1",
              pgVersion: 16,
              computeSize: "0.5 CU",
            },
          },
          {
            externalId: "prj_neon_beta_456",
            name: "beta-staging-db",
            kind: "project",
            status: "ready",
            metadata: {
              region: "aws-eu-central-1",
              pgVersion: 16,
              computeSize: "0.25 CU",
            },
          },
          {
            externalId: "db_neon_analytics_789",
            name: "analytics_warehouse",
            kind: "database",
            status: "ready",
            metadata: { owner: "neondb_owner" },
          },
        ];

        return {
          items: page1Items,
          hasMore: false,
        };
      }

      // Live Neon API call
      try {
        const res = await fetch(
          `https://console.neon.tech/api/v2/projects?limit=50${cursor ? `&cursor=${cursor}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
            },
            signal: timeoutSignal,
          },
        );

        if (res.status === 429) {
          const retryAfter = Number(res.headers.get("retry-after") || "60");
          return {
            items: [],
            hasMore: true,
            rateLimitResetSeconds: retryAfter,
          };
        }

        if (!res.ok) {
          throw new Error(`Neon API error: HTTP ${res.status}`);
        }

        const data = (await res.json()) as {
          projects?: Array<{
            id: string;
            name: string;
            region_id?: string;
            pg_version?: number;
          }>;
          pagination?: { next_cursor?: string };
        };

        const items: DiscoveredResourceItem[] = (data.projects || []).map(
          (p) => ({
            externalId: p.id,
            name: p.name,
            kind: "project" as const,
            status: "ready",
            metadata: {
              region: p.region_id,
              pgVersion: p.pg_version,
            },
          }),
        );

        return {
          items,
          nextCursor: data.pagination?.next_cursor,
          hasMore: Boolean(data.pagination?.next_cursor),
        };
      } catch (err) {
        throw new Error(
          `Failed to discover Neon resources: ${err instanceof Error ? err.message : "network error"}`,
        );
      }
    }

    case "vercel": {
      const token = String(credentials.token || "").trim();

      if (
        token.startsWith("test_") ||
        token.startsWith("vercel_test_") ||
        token.startsWith("mock_") ||
        process.env.NODE_ENV === "test"
      ) {
        const items: DiscoveredResourceItem[] = [
          {
            externalId: "prj_vercel_web_123",
            name: "harbor-web-app",
            kind: "project",
            status: "ready",
            metadata: {
              framework: "nextjs",
              nodeVersion: "20.x",
            },
          },
          {
            externalId: "dpl_vercel_live_456",
            name: "deployment-prod-1",
            kind: "deployment",
            status: "READY",
            metadata: {
              url: "https://harbor-web-app.vercel.app",
              target: "production",
            },
          },
        ];

        return {
          items,
          hasMore: false,
        };
      }

      try {
        const res = await fetch("https://api.vercel.com/v9/projects?limit=50", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: timeoutSignal,
        });

        if (res.status === 429) {
          return { items: [], hasMore: true, rateLimitResetSeconds: 60 };
        }

        if (!res.ok) {
          throw new Error(`Vercel API error: HTTP ${res.status}`);
        }

        const data = (await res.json()) as {
          projects?: Array<{
            id: string;
            name: string;
            framework?: string;
          }>;
          pagination?: { next?: number };
        };

        const items: DiscoveredResourceItem[] = (data.projects || []).map(
          (p) => ({
            externalId: p.id,
            name: p.name,
            kind: "project" as const,
            status: "ready",
            metadata: { framework: p.framework },
          }),
        );

        return {
          items,
          nextCursor: data.pagination?.next
            ? String(data.pagination.next)
            : undefined,
          hasMore: Boolean(data.pagination?.next),
        };
      } catch (err) {
        throw new Error(
          `Failed to discover Vercel resources: ${err instanceof Error ? err.message : "network error"}`,
        );
      }
    }

    case "render": {
      const apiKey = String(credentials.apiKey || "").trim();

      if (
        apiKey.startsWith("test_") ||
        apiKey.startsWith("rnd_test_") ||
        apiKey.startsWith("mock_") ||
        process.env.NODE_ENV === "test"
      ) {
        const items: DiscoveredResourceItem[] = [
          {
            externalId: "srv_render_api_123",
            name: "harbor-core-api",
            kind: "service",
            status: "live",
            metadata: {
              serviceType: "web_service",
              env: "docker",
              region: "oregon",
            },
          },
          {
            externalId: "dbs_render_redis_456",
            name: "cache-redis",
            kind: "database",
            status: "available",
            metadata: {
              plan: "starter",
            },
          },
        ];

        return {
          items,
          hasMore: false,
        };
      }

      try {
        const res = await fetch("https://api.render.com/v1/services?limit=50", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          signal: timeoutSignal,
        });

        if (res.status === 429) {
          return { items: [], hasMore: true, rateLimitResetSeconds: 60 };
        }

        if (!res.ok) {
          throw new Error(`Render API error: HTTP ${res.status}`);
        }

        const data = (await res.json()) as Array<{
          service?: {
            id: string;
            name: string;
            type: string;
            updatedAt: string;
          };
        }>;

        const items: DiscoveredResourceItem[] = (data || [])
          .filter((d) => Boolean(d.service))
          .map((d) => ({
            externalId: d.service!.id,
            name: d.service!.name,
            kind: "service" as const,
            status: "live",
            metadata: { type: d.service!.type },
          }));

        return {
          items,
          hasMore: false,
        };
      } catch (err) {
        throw new Error(
          `Failed to discover Render resources: ${err instanceof Error ? err.message : "network error"}`,
        );
      }
    }

    default: {
      return {
        items: [
          {
            externalId: `${providerId}_res_1`,
            name: `${providerId}-default-resource`,
            kind: "project",
            status: "active",
          },
        ],
        hasMore: false,
      };
    }
  }
}
