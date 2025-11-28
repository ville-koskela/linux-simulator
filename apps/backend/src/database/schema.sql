-- Create users table (minimal for now, will expand later)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create filesystem_nodes table
CREATE TABLE IF NOT EXISTS filesystem_nodes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES filesystem_nodes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('file', 'directory')),
  content TEXT,
  permissions VARCHAR(10) DEFAULT 'rwxr-xr-x',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_name_per_parent UNIQUE (user_id, parent_id, name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_filesystem_user_parent ON filesystem_nodes(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_filesystem_user_id ON filesystem_nodes(user_id);

-- Insert default user
INSERT INTO users (id, username, email) 
VALUES (1, 'demo', 'demo@linux-simulator.local')
ON CONFLICT (id) DO NOTHING;

-- Insert root directory for default user
INSERT INTO filesystem_nodes (id, user_id, parent_id, name, type, permissions)
VALUES (1, 1, NULL, '/', 'directory', 'rwxr-xr-x')
ON CONFLICT DO NOTHING;

-- Insert basic Linux directory structure
INSERT INTO filesystem_nodes (user_id, parent_id, name, type, permissions) VALUES
  (1, 1, 'home', 'directory', 'rwxr-xr-x'),
  (1, 1, 'etc', 'directory', 'rwxr-xr-x'),
  (1, 1, 'var', 'directory', 'rwxr-xr-x'),
  (1, 1, 'usr', 'directory', 'rwxr-xr-x'),
  (1, 1, 'tmp', 'directory', 'rwxrwxrwx')
ON CONFLICT DO NOTHING;

-- Get home directory id
DO $$
DECLARE
  home_id INTEGER;
  demo_id INTEGER;
BEGIN
  SELECT id INTO home_id FROM filesystem_nodes WHERE user_id = 1 AND name = 'home' AND parent_id = 1;
  
  -- Insert /home/demo
  INSERT INTO filesystem_nodes (user_id, parent_id, name, type, permissions)
  VALUES (1, home_id, 'demo', 'directory', 'rwxr-xr-x')
  ON CONFLICT DO NOTHING
  RETURNING id INTO demo_id;
  
  -- If demo_id is null, fetch it
  IF demo_id IS NULL THEN
    SELECT id INTO demo_id FROM filesystem_nodes WHERE user_id = 1 AND parent_id = home_id AND name = 'demo';
  END IF;
  
  -- Insert welcome file
  INSERT INTO filesystem_nodes (user_id, parent_id, name, type, content, permissions)
  VALUES (1, demo_id, 'welcome.txt', 'file', 
    'Welcome to Linux Simulator!

This is a simulated Linux filesystem where you can practice basic Linux commands.
Try exploring the filesystem with commands like:
  - ls (list files)
  - cd (change directory)
  - cat (view file contents)
  - mkdir (create directory)
  - touch (create file)

Have fun learning!',
    'rw-r--r--')
  ON CONFLICT DO NOTHING;
END $$;
