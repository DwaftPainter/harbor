CREATE TABLE "external_resources" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"connection_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"resource_kind" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text,
	"normalized_status" text DEFAULT 'unknown' NOT NULL,
	"metadata" jsonb,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_stale" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "external_resources_conn_kind_external_unique" UNIQUE("connection_id","resource_kind","external_id")
);
--> statement-breakpoint
CREATE TABLE "resource_relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"source_resource_id" text NOT NULL,
	"target_resource_id" text NOT NULL,
	"relationship_type" text NOT NULL,
	"confidence" text DEFAULT 'observed' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resource_rel_unique" UNIQUE("organization_id","source_resource_id","target_resource_id","relationship_type")
);
--> statement-breakpoint
ALTER TABLE "external_resources" ADD CONSTRAINT "external_resources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_resources" ADD CONSTRAINT "external_resources_connection_id_provider_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."provider_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_relationships" ADD CONSTRAINT "resource_relationships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_relationships" ADD CONSTRAINT "resource_relationships_source_resource_id_external_resources_id_fk" FOREIGN KEY ("source_resource_id") REFERENCES "public"."external_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_relationships" ADD CONSTRAINT "resource_relationships_target_resource_id_external_resources_id_fk" FOREIGN KEY ("target_resource_id") REFERENCES "public"."external_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "external_resources_org_kind_idx" ON "external_resources" USING btree ("organization_id","resource_kind");--> statement-breakpoint
CREATE INDEX "external_resources_org_status_idx" ON "external_resources" USING btree ("organization_id","normalized_status");--> statement-breakpoint
CREATE INDEX "external_resources_org_created_idx" ON "external_resources" USING btree ("organization_id","created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "external_resources_conn_stale_idx" ON "external_resources" USING btree ("connection_id","is_stale");--> statement-breakpoint
CREATE INDEX "resource_rel_source_idx" ON "resource_relationships" USING btree ("organization_id","source_resource_id");--> statement-breakpoint
CREATE INDEX "resource_rel_target_idx" ON "resource_relationships" USING btree ("organization_id","target_resource_id");