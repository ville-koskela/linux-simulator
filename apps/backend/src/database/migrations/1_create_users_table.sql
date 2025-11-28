-- Create users table (minimal for now, will expand later)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user (root)
INSERT INTO users (id, username, email) 
VALUES (1, 'root', 'root@linux-simulator.local')
ON CONFLICT (id) DO NOTHING;
