CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"observed_timestamp" timestamp with time zone,
	"severity_number" varchar(20),
	"severity_text" varchar(50),
	"body" text,
	"trace_id" varchar(32),
	"span_id" varchar(16),
	"service_name" varchar(255),
	"environment" varchar(100),
	"attributes" jsonb,
	"resource_attributes" jsonb,
	"scope_name" varchar(255),
	"scope_version" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logs_project_timestamp_idx" ON "logs" USING btree ("project_id","timestamp");--> statement-breakpoint
CREATE INDEX "logs_project_service_idx" ON "logs" USING btree ("project_id","service_name");--> statement-breakpoint
CREATE INDEX "logs_project_severity_idx" ON "logs" USING btree ("project_id","severity_text");--> statement-breakpoint
CREATE INDEX "logs_project_trace_idx" ON "logs" USING btree ("project_id","trace_id");--> statement-breakpoint
CREATE INDEX "logs_project_environment_idx" ON "logs" USING btree ("project_id","environment");