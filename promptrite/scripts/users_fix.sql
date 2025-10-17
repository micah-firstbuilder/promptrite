-- Ensure required columns exist on users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS elo_rating integer NOT NULL DEFAULT 1200;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text;

-- Unique index for username when provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'users_username_unique' AND n.nspname = 'public'
  ) THEN
    CREATE UNIQUE INDEX users_username_unique ON public.users (username) WHERE username IS NOT NULL;
  END IF;
END $$;




