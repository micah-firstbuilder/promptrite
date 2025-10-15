ALTER TABLE "examples"
  ADD COLUMN IF NOT EXISTS "parent_id" integer;

ALTER TABLE "examples"
  ADD CONSTRAINT IF NOT EXISTS "examples_parent_id_examples_id_fk"
  FOREIGN KEY ("parent_id") REFERENCES "public"."examples"("id") ON DELETE cascade ON UPDATE no action;


