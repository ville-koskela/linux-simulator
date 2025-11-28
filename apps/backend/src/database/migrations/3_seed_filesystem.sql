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

-- Create root home directory
DO $$
DECLARE
  root_home_id INTEGER;
BEGIN
  -- Insert /root (root user's home directory)
  INSERT INTO filesystem_nodes (user_id, parent_id, name, type, permissions)
  VALUES (1, 1, 'root', 'directory', 'rwx------')
  ON CONFLICT DO NOTHING
  RETURNING id INTO root_home_id;
  
  -- If root_home_id is null, fetch it
  IF root_home_id IS NULL THEN
    SELECT id INTO root_home_id FROM filesystem_nodes WHERE user_id = 1 AND parent_id = 1 AND name = 'root';
  END IF;
  
  -- Insert welcome file
  INSERT INTO filesystem_nodes (user_id, parent_id, name, type, content, permissions)
  VALUES (1, root_home_id, 'welcome.txt', 'file', 
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
