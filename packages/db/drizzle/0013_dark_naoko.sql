CREATE TABLE "metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(500) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" varchar(1000),
	"unit" varchar(100),
	"service_name" varchar(255),
	"environment" varchar(100),
	"value" double precision NOT NULL,
	"attributes" jsonb,
	"resource_attributes" jsonb,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "metrics_project_timestamp_idx" ON "metrics" USING btree ("project_id","timestamp");--> statement-breakpoint
CREATE INDEX "metrics_project_name_idx" ON "metrics" USING btree ("project_id","name");--> statement-breakpoint
CREATE INDEX "metrics_project_service_idx" ON "metrics" USING btree ("project_id","service_name");--> statement-breakpoint
CREATE INDEX "metrics_project_type_idx" ON "metrics" USING btree ("project_id","type");--> statement-breakpoint
CREATE INDEX "metrics_project_service_timestamp_idx" ON "metrics" USING btree ("project_id","service_name","timestamp");