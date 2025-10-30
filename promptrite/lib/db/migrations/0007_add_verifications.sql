-- Create verifications table for tracking verification results
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

-- Add foreign key constraint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;

-- Create index for fast lookup by submission
CREATE INDEX "verifications_submission_id_idx" ON "verifications" ("submission_id");
