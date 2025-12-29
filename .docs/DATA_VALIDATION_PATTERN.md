# Data Validation Pattern

## Core Principle: Validate at the Edges

All data crossing application boundaries **MUST** be validated at the point where it enters the application. This applies to:

- **Frontend → Backend**: When the UI sends requests to the API
- **Backend → Frontend**: When the UI receives responses from the API
- **Any external input**: User input, external APIs, database queries, etc.

## Schema Location

All validation schemas **MUST** be defined in:
```
./packages/shared/src/
```

These schemas must be:
- Written using **Zod**
- Exported from `./packages/shared`
- Shared between frontend and backend applications

## Implementation Rules

### 1. Backend (API) - Incoming Requests

When the backend receives a request from the frontend:

```typescript
// ❌ WRONG - No validation
async handleRequest(payload: any) {
  // Dangerous: payload is not validated
}

// ✅ CORRECT - Validate with shared schema
import { createUserRequestSchema } from '@shared/types';

async handleRequest(payload: unknown) {
  const validatedData = createUserRequestSchema.parse(payload);
  // Safe: validatedData is validated and typed
}
```

### 2. Frontend (UI) - Incoming Responses

When the frontend receives a response from the backend:

```typescript
// ❌ WRONG - Trusting API response without validation
const response = await fetch('/api/users');
const data = await response.json();
// Dangerous: data structure is not guaranteed

// ✅ CORRECT - Validate with shared schema
import { userResponseSchema } from '@shared/types';

const response = await fetch('/api/users');
const json = await response.json();
const data = userResponseSchema.parse(json);
// Safe: data is validated and typed
```

### 3. Frontend (UI) - Outgoing Requests

When the frontend sends data to the backend:

```typescript
// ✅ CORRECT - Type the payload from shared types
import { CreateUserRequest, createUserRequestSchema } from '@shared/types';

const payload: CreateUserRequest = {
  username: 'john',
  email: 'john@example.com'
};

await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify(payload satisfies CreateUserRequest)
});
```

### 4. Backend (API) - Outgoing Responses

The backend should return data that conforms to shared schemas:

```typescript
// ✅ CORRECT - Return data matching shared schema
import { UserResponse, userResponseSchema } from '@shared/types';

async getUser(id: string): Promise<UserResponse> {
  const user = await this.db.findUser(id);
  
  const response: UserResponse = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  
  return response;
}
```

## Benefits

1. **Type Safety**: TypeScript types are automatically inferred from Zod schemas
2. **Runtime Validation**: Catches invalid data at runtime, not just compile time
3. **Single Source of Truth**: One schema definition for both frontend and backend
4. **Automatic Synchronization**: Changes to schemas immediately affect both apps
5. **Clear Contracts**: API contracts are explicitly defined and enforced

## Schema Definition Example

In `./packages/shared/src/types/`:

```typescript
import { z } from 'zod';

// Define the schema
export const createUserRequestSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8)
});

// Export the TypeScript type
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

// Define response schema
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime()
});

export type UserResponse = z.infer<typeof userResponseSchema>;
```

## Naming Convention

- **Schemas**: Use camelCase starting with lowercase (e.g., `createUserRequestSchema`, `userResponseSchema`)
- **Types**: Use PascalCase starting with uppercase (e.g., `CreateUserRequest`, `UserResponse`)

This convention helps distinguish between runtime schemas (lowercase) and compile-time types (uppercase).

## Key Takeaways

- **Always validate** data when it enters your application (at the edges)
- **Always use** Zod schemas from `./packages/shared`
- **Never trust** external data without validation
- **Keep schemas** as the single source of truth for data contracts
- **Both apps** (frontend and backend) must use the same schemas
