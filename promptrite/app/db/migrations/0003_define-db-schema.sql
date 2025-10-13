-- Create new challenges table
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"goals" jsonb NOT NULL,
	"difficulty" varchar(50) DEFAULT 'medium' NOT NULL,
	"category" varchar(100) NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create new submissions table
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" integer NOT NULL,
	"prompt" text NOT NULL,
	"type" varchar(50) DEFAULT 'text' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add new columns to users table
ALTER TABLE "users" ADD COLUMN "elo_rating" integer DEFAULT 1200 NOT NULL;
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;

-- Add foreign key constraints
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;

-- Migrate data from progress to submissions table
INSERT INTO "submissions" (user_id, challenge_id, prompt, type, score, metadata, created_at)
SELECT 
    user_id,
    challenge_id::integer,
    COALESCE(metadata->>'prompt', 'Completed challenge') as prompt,
    COALESCE(metadata->>'type', 'text') as type,
    score,
    metadata,
    created_at
FROM "progress";

-- Create a default challenge for migrated data that doesn't have corresponding challenges
INSERT INTO "challenges" (title, description, goals, difficulty, category, is_active)
VALUES 
    ('Migrated Challenge', 'Challenge migrated from old system', '[{"criteria": "completion"}]', 'medium', 'general', 1)
ON CONFLICT DO NOTHING;

-- Update submissions to point to valid challenge IDs
UPDATE "submissions" 
SET challenge_id = 1 
WHERE challenge_id NOT IN (SELECT id FROM "challenges");

-- Note: We'll keep the old tables for now and drop them in a future migration after validation
-- DROP TABLE "baseline_metrics" CASCADE;
-- DROP TABLE "progress" CASCADE;