CREATE TABLE "connection_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"encrypted_data" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"key_version" text DEFAULT 'v1' NOT NULL,
	"fingerprint" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "connection_credentials_connection_id_unique" UNIQUE("connection_id")
);
--> statement-breakpoint
CREATE TABLE "provider_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'connected' NOT NULL,
	"external_account_id" text,
	"external_account_name" text,
	"scope" text,
	"last_validated_at" timestamp with time zone,
	"last_sync_at" timestamp with time zone,
	"error_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "connection_credentials" ADD CONSTRAINT "connection_credentials_connection_id_provider_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."provider_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_connections" ADD CONSTRAINT "provider_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connection_credentials_connection_id_idx" ON "connection_credentials" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "provider_connections_org_provider_idx" ON "provider_connections" USING btree ("organization_id","provider_id");--> statement-breakpoint
CREATE INDEX "provider_connections_org_created_idx" ON "provider_connections" USING btree ("organization_id","created_at" DESC NULLS LAST);