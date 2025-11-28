# Logger Service

Centralized logging service for the backend application.

## Features

- **Injectable Service**: Can be injected into any module
- **Context Support**: Each service can set its own context
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Environment-based**: Configurable via `LOG_LEVEL` env var
- **Structured Logging**: Timestamp and context included in all logs
- **Future-proof**: Easy to swap console for Winston, Pino, or custom transport

## Usage

### Inject into Service

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MyService {
  constructor(private logger: LoggerService) {
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

## Current Implementation

Uses `console.log`, `console.warn`, `console.error`, etc. All logs are formatted with:
- ISO timestamp
- Log level
- Context (if set)
- Message

Example output:
```
2025-11-28T10:30:45.123Z [INFO] [DatabaseService] Query executed in 15ms - 5 rows
2025-11-28T10:30:46.456Z [ERROR] [FilesystemService] Node not found
```

## Future Enhancements

Replace console logging with:
- **Winston** - File rotation, multiple transports
- **Pino** - High-performance JSON logging
- **Custom transport** - Send to external logging service (Datadog, CloudWatch, etc.)

The centralized design makes this a one-file change.
