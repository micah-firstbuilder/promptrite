CREATE TABLE "baseline_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"metric_type" text NOT NULL,
	"value" integer NOT NULL,
	"baseline_value" integer,
	"improvement_percentage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
