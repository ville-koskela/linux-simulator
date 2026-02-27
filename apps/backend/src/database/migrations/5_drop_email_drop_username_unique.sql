-- Drop the email column (never populated from OAuth, not used anywhere)
ALTER TABLE users
  DROP COLUMN IF EXISTS email;

-- Drop the unique constraint on username.
-- oauth_sub is the stable identity; username is just a display label from
-- preferred_username. If an account is deleted from the OAuth provider and a
-- new account is later created with the same username it will have a different
-- oauth_sub, so the unique constraint would cause a spurious conflict.
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_username_key;

-- Make oauth_sub mandatory. Give the seeded root user a well-known placeholder
-- so the NOT NULL constraint can be satisfied without a real OAuth identity.
UPDATE users
  SET oauth_sub = 'system:root'
  WHERE id = 1 AND oauth_sub IS NULL;

ALTER TABLE users
  ALTER COLUMN oauth_sub SET NOT NULL;
