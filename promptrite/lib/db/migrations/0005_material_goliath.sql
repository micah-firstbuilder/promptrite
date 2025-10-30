CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"verifier_type" varchar(50) NOT NULL,
	"llm_model_used" varchar(255) NOT NULL,
	"embedding_model_used" varchar(255) NOT NULL,
	"llm_score" integer NOT NULL,
	"verifier_score" integer,
	"embed_similarity" integer,
	"composite_score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "examples" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examples" ADD CONSTRAINT "examples_parent_id_examples_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;