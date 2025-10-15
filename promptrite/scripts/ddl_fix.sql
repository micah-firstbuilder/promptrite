-- Minimal tables to unblock examples API

-- challenges (minimal)
CREATE TABLE IF NOT EXISTS public.challenges (
  id serial PRIMARY KEY
);

-- submissions (minimal, matches fields used by code)
CREATE TABLE IF NOT EXISTS public.submissions (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  challenge_id integer NOT NULL,
  prompt text NOT NULL DEFAULT '',
  type varchar(50) NOT NULL DEFAULT 'text',
  score integer NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);

-- examples
CREATE TABLE IF NOT EXISTS public.examples (
  id serial PRIMARY KEY,
  challenge_id integer NOT NULL,
  content text NOT NULL,
  created_by text,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now()
);

-- basic index for examples list
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'examples_challenge_id_created_at_idx' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX examples_challenge_id_created_at_idx ON public.examples (challenge_id, created_at DESC);
  END IF;
END $$;


