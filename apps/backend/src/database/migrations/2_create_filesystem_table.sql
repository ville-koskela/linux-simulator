-- Create filesystem_nodes table
CREATE TABLE IF NOT EXISTS filesystem_nodes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES filesystem_nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'directory')),
  content TEXT,
  permissions TEXT DEFAULT 'rwxr-xr-x',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_name_per_parent UNIQUE (user_id, parent_id, name)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_filesystem_nodes_user_parent ON filesystem_nodes(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_filesystem_nodes_user_id ON filesystem_nodes(user_id);
