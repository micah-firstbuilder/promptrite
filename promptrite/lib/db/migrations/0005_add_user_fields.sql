-- Add profile fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;

-- Optional: unique username when provided
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username) WHERE username IS NOT NULL;

-- Touch updated_at on existing rows to reflect schema change
UPDATE users SET updated_at = NOW() WHERE TRUE;


