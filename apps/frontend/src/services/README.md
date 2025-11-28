# Services

This directory contains API service clients for communicating with the backend.

## FilesystemService

The `FilesystemService` provides methods to interact with the filesystem API.

### Methods

- **`getNodeByPath(path: string)`** - Get a filesystem node by its path
  - Returns `FilesystemNode | null`
  - Example: `await FilesystemService.getNodeByPath('/home/user')`

- **`getChildren(parentId: number | null)`** - Get children of a directory
  - Returns `FilesystemNode[]`
  - Pass `null` for root directory
  - Example: `await FilesystemService.getChildren(42)`

- **`createNode(parentId, name, type, content?)`** - Create a new file or directory
  - `parentId`: ID of parent directory
  - `name`: Name of the new node
  - `type`: `'file'` or `'directory'`
  - `content`: Optional file content (for files)
  - Returns `FilesystemNode`

- **`updateNode(id, updates)`** - Update a node (rename, change content, etc.)
  - `id`: Node ID
  - `updates`: Object with `name?`, `content?`, or `permissions?`
  - Returns `FilesystemNode`

- **`deleteNode(id)`** - Delete a file or directory
  - `id`: Node ID
  - Returns `void`

- **`moveNode(id, newParentId)`** - Move a node to a different directory
  - `id`: Node ID to move
  - `newParentId`: ID of new parent directory
  - Returns `FilesystemNode`

### Configuration

The API base URL is configured via the `VITE_API_URL` environment variable. Default: `http://localhost:3000`

Create a `.env` file in the frontend root:
```
VITE_API_URL=http://localhost:3000
```
