import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;
  private logLevel: LogLevel;

  constructor(context?: string) {
    this.context = context;
    this.logLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      default:
        return process.env.NODE_ENV === 'production'
          ? LogLevel.INFO
          : LogLevel.DEBUG;
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? `[${this.context}]` : '';
    return `${timestamp} [${level}] ${ctx} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  log(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const ctx = context || this.context;
      console.log(this.formatMessage('INFO', message));
    }
  }

  error(message: string, trace?: string, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const ctx = context || this.context;
      console.error(this.formatMessage('ERROR', message));
      if (trace) {
        console.error(trace);
      }
    }
  }

  warn(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const ctx = context || this.context;
      console.warn(this.formatMessage('WARN', message));
    }
  }

  debug(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const ctx = context || this.context;
      console.debug(this.formatMessage('DEBUG', message));
    }
  }

  verbose(message: string, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const ctx = context || this.context;
      console.log(this.formatMessage('VERBOSE', message));
    }
  }

  // Create a child logger with a specific context
  setContext(context: string): void {
    this.context = context;
  }
}
