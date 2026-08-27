CREATE TABLE "spans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"trace_id" varchar(32) NOT NULL,
	"span_id" varchar(16) NOT NULL,
	"parent_span_id" varchar(16),
	"trace_record_id" uuid,
	"service_name" varchar(255) NOT NULL,
	"name" varchar(500) NOT NULL,
	"kind" varchar(50) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"duration_ms" bigint,
	"status" varchar(20) NOT NULL,
	"status_message" varchar(1000),
	"attributes" jsonb,
	"resource_attributes" jsonb,
	"events" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"trace_id" varchar(32) NOT NULL,
	"service_name" varchar(255) NOT NULL,
	"environment" varchar(100),
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"duration_ms" bigint,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spans" ADD CONSTRAINT "spans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spans" ADD CONSTRAINT "spans_trace_record_id_traces_id_fk" FOREIGN KEY ("trace_record_id") REFERENCES "public"."traces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "traces" ADD CONSTRAINT "traces_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spans_project_trace_idx" ON "spans" USING btree ("project_id","trace_id");--> statement-breakpoint
CREATE INDEX "spans_trace_span_idx" ON "spans" USING btree ("trace_id","span_id");--> statement-breakpoint
CREATE INDEX "spans_parent_span_idx" ON "spans" USING btree ("trace_id","parent_span_id");--> statement-breakpoint
CREATE INDEX "spans_project_start_time_idx" ON "spans" USING btree ("project_id","start_time");--> statement-breakpoint
CREATE INDEX "spans_project_service_idx" ON "spans" USING btree ("project_id","service_name");--> statement-breakpoint
CREATE INDEX "traces_project_trace_id_idx" ON "traces" USING btree ("project_id","trace_id");--> statement-breakpoint
CREATE INDEX "traces_project_start_time_idx" ON "traces" USING btree ("project_id","start_time");--> statement-breakpoint
CREATE INDEX "traces_project_service_idx" ON "traces" USING btree ("project_id","service_name");