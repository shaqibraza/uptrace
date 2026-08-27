DROP INDEX "traces_project_trace_id_idx";--> statement-breakpoint
ALTER TABLE "spans" ADD CONSTRAINT "spans_project_trace_span_unique" UNIQUE("project_id","trace_id","span_id");--> statement-breakpoint
ALTER TABLE "traces" ADD CONSTRAINT "traces_project_trace_id_unique" UNIQUE("project_id","trace_id");