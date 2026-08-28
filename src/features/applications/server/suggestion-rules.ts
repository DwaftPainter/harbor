import type { ExternalResourceDTO } from "@/features/resources/types";

import type { BindingSuggestionDTO, EnvironmentDTO } from "../types";

/**
 * Pure deterministic rule engine for resource binding suggestions.
 * Evaluates candidate unassigned resources against an application's name, slug, and environments.
 */
export function generateBindingSuggestions(
  app: { name: string; slug: string },
  environments: EnvironmentDTO[],
  unboundResources: ExternalResourceDTO[],
  boundResourceIds: Set<string>,
): BindingSuggestionDTO[] {
  const suggestions: BindingSuggestionDTO[] = [];
  const appSlugNorm = app.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  const appNameNorm = app.name.toLowerCase().replace(/[^a-z0-9]/g, "");

  const prodEnv =
    environments.find((e) => e.isProduction || e.slug === "production")?.slug ||
    "production";
  const stageEnv =
    environments.find((e) => e.slug === "staging")?.slug || "staging";
  const devEnv =
    environments.find((e) => e.slug === "development")?.slug || "development";
  const prevEnv =
    environments.find((e) => e.slug === "preview")?.slug || "preview";

  for (const res of unboundResources) {
    if (boundResourceIds.has(res.id)) continue;

    const resNameNorm = res.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const resRaw = res.name.toLowerCase();

    // Check name correlation
    const matchesApp =
      resNameNorm.includes(appSlugNorm) ||
      (appSlugNorm.length >= 4 && appSlugNorm.includes(resNameNorm)) ||
      resNameNorm.includes(appNameNorm);

    if (matchesApp) {
      let targetEnv = prodEnv;
      let reason = `Resource name "${res.name}" matches application identifier "${app.slug}"`;
      let confidence: "high" | "medium" | "low" = "medium";

      if (resRaw.includes("stage") || resRaw.includes("staging")) {
        targetEnv = stageEnv;
        reason += " (detected staging naming convention)";
        confidence = "high";
      } else if (
        resRaw.includes("dev") ||
        resRaw.includes("development") ||
        resRaw.includes("local")
      ) {
        targetEnv = devEnv;
        reason += " (detected development naming convention)";
        confidence = "high";
      } else if (
        resRaw.includes("preview") ||
        resRaw.includes("pr-") ||
        resRaw.includes("test")
      ) {
        targetEnv = prevEnv;
        reason += " (detected preview/test naming convention)";
        confidence = "high";
      } else if (
        resRaw.includes("prod") ||
        resRaw.includes("production") ||
        resRaw.includes("live")
      ) {
        targetEnv = prodEnv;
        reason += " (detected production naming convention)";
        confidence = "high";
      }

      suggestions.push({
        resourceId: res.id,
        suggestedEnvironmentSlug: targetEnv,
        confidence,
        reason,
        resource: res,
      });
    }
  }

  return suggestions;
}
