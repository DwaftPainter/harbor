import assert from "node:assert/strict";
import test from "node:test";

import { generateBindingSuggestions } from "../src/features/applications/server/suggestion-rules.ts";
import {
  BINDING_SOURCES,
  bindResourceSchema,
  createApplicationSchema,
  createEnvironmentSchema,
  DEFAULT_ENVIRONMENTS,
  ENVIRONMENT_CLASSIFICATIONS,
  updateApplicationSchema,
  updateEnvironmentSchema,
} from "../src/features/applications/types.ts";

test("application and environment constant enumerations completeness", () => {
  assert.deepEqual(
    [...ENVIRONMENT_CLASSIFICATIONS].sort(),
    ["custom", "development", "preview", "production", "staging"].sort(),
  );

  assert.deepEqual(
    [...BINDING_SOURCES].sort(),
    ["auto_inferred", "manual", "suggested"].sort(),
  );

  assert.equal(DEFAULT_ENVIRONMENTS.length, 3);
  assert.equal(DEFAULT_ENVIRONMENTS[0]?.slug, "production");
  assert.equal(DEFAULT_ENVIRONMENTS[0]?.isProduction, true);
  assert.equal(DEFAULT_ENVIRONMENTS[1]?.slug, "staging");
  assert.equal(DEFAULT_ENVIRONMENTS[2]?.slug, "development");
});

test("application and environment Zod validation schemas", () => {
  // 1. Create Application
  const validApp = createApplicationSchema.parse({
    name: "E-Commerce Core",
    slug: "ecommerce-core",
    description: "Core storefront and backend services",
  });
  assert.equal(validApp.name, "E-Commerce Core");
  assert.equal(validApp.slug, "ecommerce-core");
  assert.equal(validApp.defaultEnvironments, true);

  assert.throws(() => {
    createApplicationSchema.parse({ name: "" });
  });

  // 2. Update Application
  const validAppUpdate = updateApplicationSchema.parse({
    name: "Updated App Name",
    description: null,
  });
  assert.equal(validAppUpdate.name, "Updated App Name");
  assert.equal(validAppUpdate.description, null);

  // 3. Create Environment
  const validEnv = createEnvironmentSchema.parse({
    name: "QA Testing",
    slug: "qa-testing",
    classification: "staging",
    isProduction: false,
  });
  assert.equal(validEnv.name, "QA Testing");
  assert.equal(validEnv.classification, "staging");

  // 4. Update Environment
  const validEnvUpdate = updateEnvironmentSchema.parse({
    isProduction: true,
    orderIndex: 3,
  });
  assert.equal(validEnvUpdate.isProduction, true);
  assert.equal(validEnvUpdate.orderIndex, 3);

  // 5. Bind Resource
  const validBinding = bindResourceSchema.parse({
    environmentId: "env-123",
    resourceId: "res-456",
    isPrimary: true,
  });
  assert.equal(validBinding.environmentId, "env-123");
  assert.equal(validBinding.resourceId, "res-456");
  assert.equal(validBinding.isPrimary, true);
  assert.equal(validBinding.bindingSource, "manual");
});

test("generateBindingSuggestions deterministic rule engine", () => {
  const app = { name: "Storefront", slug: "storefront" };
  const envs = [
    {
      id: "env-prod",
      organizationId: "org-1",
      applicationId: "app-1",
      name: "Production",
      slug: "production",
      classification: "production",
      isProduction: true,
      orderIndex: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "env-stage",
      organizationId: "org-1",
      applicationId: "app-1",
      name: "Staging",
      slug: "staging",
      classification: "staging",
      isProduction: false,
      orderIndex: 1,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const unboundResources = [
    {
      id: "res-1",
      organizationId: "org-1",
      connectionId: "conn-1",
      providerId: "neon",
      resourceKind: "database",
      externalId: "neon-db-1",
      name: "storefront-prod-db",
      status: "ready",
      normalizedStatus: "running",
      metadata: {},
      lastSeenAt: new Date().toISOString(),
      isStale: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "res-2",
      organizationId: "org-1",
      connectionId: "conn-2",
      providerId: "vercel",
      resourceKind: "project",
      externalId: "vercel-prj-2",
      name: "storefront-staging-web",
      status: "ready",
      normalizedStatus: "running",
      metadata: {},
      lastSeenAt: new Date().toISOString(),
      isStale: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "res-3",
      organizationId: "org-1",
      connectionId: "conn-3",
      providerId: "render",
      resourceKind: "service",
      externalId: "rnd-srv-3",
      name: "analytics-worker", // Does not match "storefront"
      status: "live",
      normalizedStatus: "running",
      metadata: {},
      lastSeenAt: new Date().toISOString(),
      isStale: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const suggestions = generateBindingSuggestions(
    app,
    envs,
    unboundResources,
    new Set(),
  );

  assert.equal(suggestions.length, 2);

  const prodSugg = suggestions.find((s) => s.resourceId === "res-1");
  assert.ok(prodSugg);
  assert.equal(prodSugg.suggestedEnvironmentSlug, "production");
  assert.equal(prodSugg.confidence, "high");

  const stageSugg = suggestions.find((s) => s.resourceId === "res-2");
  assert.ok(stageSugg);
  assert.equal(stageSugg.suggestedEnvironmentSlug, "staging");
  assert.equal(stageSugg.confidence, "high");
});
