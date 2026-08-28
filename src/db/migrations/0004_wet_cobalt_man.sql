CREATE TABLE "discovered_resources" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"resource_kind" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text,
	"metadata" jsonb,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_stale" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discovered_resources_conn_kind_external_unique" UNIQUE("connection_id","resource_kind","external_id")
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"capability" text DEFAULT 'full' NOT NULL,
	"trigger" text DEFAULT 'manual' NOT NULL,
	"triggered_by_id" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"lease_token" text,
	"lease_expires_at" timestamp with time zone,
	"cursor" text,
	"items_observed" integer DEFAULT 0 NOT NULL,
	"items_created" integer DEFAULT 0 NOT NULL,
	"items_updated" integer DEFAULT 0 NOT NULL,
	"items_stale" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"error_summary" text,
	"error_category" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_token_unique";--> statement-breakpoint
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_organization_id_user_id_unique";--> statement-breakpoint
DROP INDEX "organizations_slug_idx";--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "role" SET DEFAULT 'member';--> statement-breakpoint
ALTER TABLE "discovered_resources" ADD CONSTRAINT "discovered_resources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discovered_resources" ADD CONSTRAINT "discovered_resources_connection_id_provider_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."provider_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_connection_id_provider_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."provider_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_triggered_by_id_user_id_fk" FOREIGN KEY ("triggered_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "discovered_resources_org_kind_idx" ON "discovered_resources" USING btree ("organization_id","resource_kind");--> statement-breakpoint
CREATE INDEX "discovered_resources_conn_stale_idx" ON "discovered_resources" USING btree ("connection_id","is_stale");--> statement-breakpoint
CREATE INDEX "sync_runs_org_created_idx" ON "sync_runs" USING btree ("organization_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "sync_runs_connection_status_idx" ON "sync_runs" USING btree ("connection_id","status");--> statement-breakpoint
CREATE INDEX "sync_runs_lease_token_idx" ON "sync_runs" USING btree ("lease_token");--> statement-breakpoint
CREATE INDEX "sync_runs_connection_capability_idx" ON "sync_runs" USING btree ("connection_id","capability");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_org_user_unique" UNIQUE("organization_id","user_id");