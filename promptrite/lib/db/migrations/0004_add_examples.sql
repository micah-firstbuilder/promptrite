-- Create examples table for anonymized peer submissions
CREATE TABLE "examples" (
  "id" serial PRIMARY KEY NOT NULL,
  "challenge_id" integer NOT NULL,
  "content" text NOT NULL,
  "created_by" text,
  "is_flagged" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign keys
ALTER TABLE "examples" ADD CONSTRAINT "examples_challenge_id_challenges_id_fk"
  FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "examples" ADD CONSTRAINT "examples_created_by_users_id_fk"
  FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- Index for listing per challenge by recency
CREATE INDEX IF NOT EXISTS "examples_challenge_id_created_at_idx"
  ON "examples" ("challenge_id", "created_at" DESC);


