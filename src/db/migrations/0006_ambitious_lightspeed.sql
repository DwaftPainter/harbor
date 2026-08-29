CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_org_slug_unique" UNIQUE("organization_id","slug")
);
--> statement-breakpoint
CREATE TABLE "environments" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"application_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"classification" text DEFAULT 'custom' NOT NULL,
	"is_production" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "environments_app_slug_unique" UNIQUE("application_id","slug")
);
--> statement-breakpoint
CREATE TABLE "resource_bindings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"application_id" text NOT NULL,
	"environment_id" text NOT NULL,
	"resource_id" text NOT NULL,
	"binding_source" text DEFAULT 'manual' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resource_bindings_env_resource_unique" UNIQUE("environment_id","resource_id")
);
--> statement-breakpoint
DROP INDEX "invitations_organization_id_idx";--> statement-breakpoint
DROP INDEX "invitations_token_idx";--> statement-breakpoint
DROP INDEX "memberships_organization_id_idx";--> statement-breakpoint
DROP INDEX "memberships_user_id_idx";--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environments" ADD CONSTRAINT "environments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environments" ADD CONSTRAINT "environments_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bindings" ADD CONSTRAINT "resource_bindings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bindings" ADD CONSTRAINT "resource_bindings_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bindings" ADD CONSTRAINT "resource_bindings_environment_id_environments_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bindings" ADD CONSTRAINT "resource_bindings_resource_id_external_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."external_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_org_archived_idx" ON "applications" USING btree ("organization_id","is_archived");--> statement-breakpoint
CREATE INDEX "applications_org_created_idx" ON "applications" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "environments_app_order_idx" ON "environments" USING btree ("application_id","order_index");--> statement-breakpoint
CREATE INDEX "environments_org_idx" ON "environments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "resource_bindings_app_idx" ON "resource_bindings" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "resource_bindings_res_idx" ON "resource_bindings" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resource_bindings_org_idx" ON "resource_bindings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_org_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "memberships_org_idx" ON "memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_token_unique" UNIQUE("token");