# Logger Service

Centralized logging service for the backend application.

## Features

- **Injectable Service**: Can be injected into any module via dependency injection
- **Transient Scope**: Each injection gets a new instance (not a singleton)
- **Context Support**: Set once per service instance
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Environment-based**: Configurable via `LOG_LEVEL` env var
- **Structured Logging**: Timestamp and context included in all logs
- **Future-proof**: Easy to swap console for Winston, Pino, or custom transport

## How NestJS Dependency Injection Works

You **never** call `new LoggerService()` yourself (except in `main.ts` for bootstrapping). NestJS automatically:
1. Creates a new instance for each injection (because of `Scope.TRANSIENT`)
2. Injects it into your service's constructor
3. Manages the lifecycle

## Usage

### Inject into Service

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MyService {
  constructor(private logger: LoggerService) {
    // Set context once in constructor
    this.logger.setContext('MyService');
  }

  async doSomething() {
    this.logger.log('Doing something...');
    this.logger.debug('Debug information');
    this.logger.warn('Warning message');
    this.logger.error('Error occurred', errorStack);
  }
}
```

**Key Points:**
- NestJS injects the logger automatically
- Call `setContext()` once in your constructor
- Each service gets its own logger instance (TRANSIENT scope)
- No need for context parameters in log methods

### Log Levels

```typescript
logger.error('Critical error', stackTrace);  // Always logged
logger.warn('Warning message');               // Logged if level >= WARN
logger.log('Info message');                   // Logged if level >= INFO
logger.debug('Debug details');                // Logged if level >= DEBUG
```

### Environment Configuration

In `.env`:

```bash
LOG_LEVEL=debug    # For development (most verbose)
LOG_LEVEL=info     # For production (default)
LOG_LEVEL=warn     # Only warnings and errors
LOG_LEVEL=error    # Only errors
```

## Why TRANSIENT Scope?

```typescript
@Injectable({ scope: Scope.TRANSIENT })
```

- **SINGLETON** (default): One instance shared across the entire app
  - Problem: All services would share the same context
  - `logger.setContext('ServiceA')` would affect ServiceB's logs too!
  
- **TRANSIENT**: New instance for each injection
  - Each service gets its own logger with its own context
  - Clean separation of concerns

## Current Implementation

Uses `console.log`, `console.warn`, `console.error`, etc. All logs are formatted with:
- ISO timestamp
- Log level
- Context (if set)
- Message

Example output:
```
2025-11-28T10:30:45.123Z [INFO] [DatabaseService] Query executed in 15ms
2025-11-28T10:30:46.456Z [ERROR] [FilesystemService] Node not found
```

## Future Enhancements

Replace console logging with:
- **Winston** - File rotation, multiple transports
- **Pino** - High-performance JSON logging
- **Custom transport** - Send to external logging service (Datadog, CloudWatch, etc.)

The centralized design makes this a one-file change.
