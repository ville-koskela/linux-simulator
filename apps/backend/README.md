# Linux Simulator Backend

NestJS backend for the Linux Simulator application, providing filesystem simulation and user management.

## Features

- **Virtual Filesystem**: PostgreSQL-backed filesystem with standard Linux directory structure
- **Raw SQL**: Using `pg` (node-postgres) for direct query control
- **Hardcoded User**: Demo user (ID: 1) for initial development

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with `pg` driver
- **Language**: TypeScript

## Setup

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql@16
   ```

2. **Create database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE linux_simulator;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE linux_simulator TO postgres;
   \q
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run migrations** (happens automatically on startup):
   The schema will be created when you start the server.

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## API Endpoints

### Filesystem

- `GET /filesystem/tree?nodeId={id}` - Get filesystem tree (defaults to root)
- `GET /filesystem/node/:id` - Get specific node by ID
- `GET /filesystem/path?path={path}` - Get node by path (e.g., `/home/demo`)
- `GET /filesystem/children?parentId={id}` - Get children of a directory
- `POST /filesystem/node` - Create new file or directory
- `PUT /filesystem/node/:id` - Update node (rename, edit content, change permissions)
- `DELETE /filesystem/node/:id` - Delete node
- `PUT /filesystem/node/:id/move` - Move node to new parent

### Example Requests

**Get full filesystem tree:**
```bash
curl http://localhost:3001/filesystem/tree
```

**Get node by path:**
```bash
curl http://localhost:3001/filesystem/path?path=/home/demo
```

**Create a file:**
```bash
curl -X POST http://localhost:3001/filesystem/node \
  -H "Content-Type: application/json" \
  -d '{
    "parentId": 2,
    "name": "test.txt",
    "type": "file",
    "content": "Hello World"
  }'
```

**Create a directory:**
```bash
curl -X POST http://localhost:3001/filesystem/node \
  -H "Content-Type: application/json" \
  -d '{
    "parentId": 2,
    "name": "mydir",
    "type": "directory"
  }'
```

## Database Schema

### Tables

**users**
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `created_at`, `updated_at` - Timestamps

**filesystem_nodes**
- `id` - Primary key
- `user_id` - Foreign key to users
- `parent_id` - Self-referencing foreign key (NULL for root)
- `name` - File/directory name
- `type` - 'file' or 'directory'
- `content` - File content (NULL for directories)
- `permissions` - Unix-style permissions (e.g., 'rwxr-xr-x')
- `created_at`, `updated_at` - Timestamps

## Default User

- **ID**: 1
- **Username**: demo
- **Email**: demo@linux-simulator.local

## Initial Filesystem Structure

```
/
├── home/
│   └── demo/
│       └── welcome.txt
├── etc/
├── var/
├── usr/
└── tmp/
```

## Future Enhancements

- [ ] User authentication (JWT)
- [ ] Exercise system with XP/leveling
- [ ] Command execution validation
- [ ] User settings persistence
- [ ] WebSocket for real-time updates

The backend shares types from `@linux-simulator/shared` package.
