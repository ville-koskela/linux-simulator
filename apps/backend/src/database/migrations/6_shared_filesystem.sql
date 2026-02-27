-- Migration 6: Move to a single shared root filesystem
--
-- Previous model: every user had a completely isolated tree (all rows were
-- partitioned by user_id).  New model: ONE shared tree visible to all users;
-- ownership / access is controlled by owner_id + Unix-style permissions.
--
-- We drop ALL existing filesystem data here using TRUNCATE, which is safe
-- because the old per-user trees are not compatible with the new model.
-- The shared root tree is (re-)seeded at the end of this migration.
--
-- Schema changes:
--   • TRUNCATE filesystem_nodes (clears all stale data)
--   • Rename user_id  → owner_id  (stays NOT NULL – always root or a real user)
--   • parent_id remains nullable: only the root node (/) has no parent
--   • Unique constraint:  (user_id, parent_id, name)  →  (parent_id, name)
--   • Indexes rebuilt accordingly

-- Step 1: wipe all existing rows so we start with a clean slate
TRUNCATE TABLE filesystem_nodes RESTART IDENTITY CASCADE;

-- Step 2: rename the ownership column; NOT NULL is preserved from the original DDL
ALTER TABLE filesystem_nodes RENAME COLUMN user_id TO owner_id;

-- Step 3: drop old user-scoped constraints and indexes
ALTER TABLE filesystem_nodes DROP CONSTRAINT IF EXISTS unique_name_per_parent;
DROP INDEX IF EXISTS idx_filesystem_nodes_user_parent;
DROP INDEX IF EXISTS idx_filesystem_nodes_user_id;

-- Step 4: new unique constraints for the shared tree
--   siblings must have unique names within their parent
CREATE UNIQUE INDEX unique_children_name
  ON filesystem_nodes (parent_id, name)
  WHERE parent_id IS NOT NULL;

--   root-level nodes (parent_id IS NULL) must also have unique names
CREATE UNIQUE INDEX unique_root_name
  ON filesystem_nodes (name)
  WHERE parent_id IS NULL;

-- Step 5: create new indexes optimised for shared-tree queries
CREATE INDEX idx_filesystem_nodes_parent ON filesystem_nodes (parent_id);
CREATE INDEX idx_filesystem_nodes_owner  ON filesystem_nodes (owner_id);

-- Step 6: seed the shared root filesystem
--   System directories are owned by the root user (id = 1, seeded in migration 1).
--   owner_id = 1 is the "root" system account (oauth_sub = 'system:root').

-- Root directory
INSERT INTO filesystem_nodes (owner_id, parent_id, name, type, permissions)
VALUES (1, NULL, '/', 'directory', 'rwxr-xr-x');

-- Top-level system directories (children of /)
INSERT INTO filesystem_nodes (owner_id, parent_id, name, type, permissions)
SELECT 1, id, dir, 'directory', perm
FROM (VALUES
  ('home', 'rwxr-xr-x'),
  ('etc',  'rwxr-xr-x'),
  ('var',  'rwxr-xr-x'),
  ('usr',  'rwxr-xr-x'),
  ('tmp',  'rwxrwxrwx')
) AS t(dir, perm), filesystem_nodes
WHERE filesystem_nodes.name = '/' AND filesystem_nodes.parent_id IS NULL;
