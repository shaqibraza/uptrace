CREATE TYPE "public"."http_check_status" AS ENUM('UP', 'DOWN');--> statement-breakpoint
CREATE TABLE "http_check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"status" "http_check_status" NOT NULL,
	"status_code" integer,
	"response_time_ms" integer,
	"error_message" text,
	"checked_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "http_check_results" ADD CONSTRAINT "http_check_results_endpoint_id_http_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."http_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "http_check_results_endpoint_checked_at_idx" ON "http_check_results" USING btree ("endpoint_id","checked_at");