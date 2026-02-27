-- Add OAuth subject identifier to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS oauth_sub TEXT UNIQUE;

-- Add index for OAuth sub lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_sub ON users(oauth_sub);
