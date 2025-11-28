# Configuration Service

Centralized environment configuration with Zod validation.

## Features

- **Type-safe**: All environment variables are validated and typed
- **Validation on Startup**: App fails fast if configuration is invalid
- **Single Source of Truth**: No `process.env` scattered throughout the code
- **Testing-friendly**: Easy to mock for tests
- **Developer-friendly**: Autocomplete and type checking for all config values

## Schema

All environment variables are validated using Zod:

```typescript
{
  // Server
  NODE_ENV: 'development' | 'production' | 'test'  // default: 'development'
  PORT: number                                      // default: 3001
  
  // Database
  DATABASE_HOST: string                            // default: 'localhost'
  DATABASE_PORT: number                            // default: 5432
  DATABASE_NAME: string                            // default: 'linux_simulator'
  DATABASE_USER: string                            // default: 'postgres'
  DATABASE_PASSWORD: string                        // default: 'postgres'
  
  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug'  // default: 'info'
  
  // CORS
  CORS_ORIGIN: string                              // default: 'http://localhost:5173'
  
  // Application
  DEFAULT_USER_ID: number                          // default: 1
}
```

## Usage

### Inject into Service

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MyService {
  constructor(private config: ConfigService) {}

  doSomething() {
    const port = this.config.port;              // Type-safe number
    const isProduction = this.config.isProduction; // boolean
    const dbHost = this.config.databaseHost;     // string
  }
}
```

### Available Getters

**Server:**
- `config.nodeEnv: string`
- `config.port: number`
- `config.isProduction: boolean`
- `config.isDevelopment: boolean`
- `config.isTest: boolean`

**Database:**
- `config.databaseHost: string`
- `config.databasePort: number`
- `config.databaseName: string`
- `config.databaseUser: string`
- `config.databasePassword: string`

**Logging:**
- `config.logLevel: string`

**CORS:**
- `config.corsOrigin: string`

**Application:**
- `config.defaultUserId: number`

**Testing:**
- `config.getAll(): Readonly<EnvConfig>` - Get all config as readonly object

## Validation

On application startup, all environment variables are validated. If validation fails:

```
❌ Invalid environment configuration:
{
  PORT: {
    _errors: [ 'Expected number, received string' ]
  }
}
Error: Environment validation failed
```

The application will **exit immediately** rather than running with invalid configuration.

## Type Coercion

Zod automatically converts string environment variables to the correct type:

```bash
PORT=3001           # String in .env
config.port         # Returns number 3001

LOG_LEVEL=debug     # String in .env  
config.logLevel     # Returns validated enum value
```

## Benefits

### Before (scattered process.env):
```typescript
// ❌ Problems:
const port = parseInt(process.env.PORT || '3001', 10);  // Repeated parsing
const dbHost = process.env.DATABASE_HOST || 'localhost'; // No validation
const isProduction = process.env.NODE_ENV === 'production'; // Typo risk
```

### After (ConfigService):
```typescript
// ✅ Benefits:
const port = this.config.port;              // Already a number
const dbHost = this.config.databaseHost;     // Validated
const isProduction = this.config.isProduction; // Type-safe helper
```

## Testing

Easy to mock for unit tests:

```typescript
const mockConfig = {
  port: 4000,
  isDevelopment: true,
  databaseHost: 'test-db',
  // ... other values
};

const configService = new ConfigService();
jest.spyOn(configService, 'getAll').mockReturnValue(mockConfig);
```

## Adding New Variables

1. Update the Zod schema in `config.service.ts`:
```typescript
const envSchema = z.object({
  // ... existing
  NEW_VAR: z.string().default('default-value'),
});
```

2. Add getter method:
```typescript
get newVar(): string {
  return this.config.NEW_VAR;
}
```

3. Update `.env.example` with the new variable

4. TypeScript will ensure all usages are type-safe!
