import {
  Injectable,
  type LoggerService as NestLoggerService,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context = "";
  private logLevel: LogLevel;

  constructor(private config: ConfigService) {
    this.logLevel = this.getLogLevelFromConfig();
  }

  private getLogLevelFromConfig(): LogLevel {
    const level = this.config.logLevel.toUpperCase();
    switch (level) {
      case "ERROR":
        return LogLevel.ERROR;
      case "WARN":
        return LogLevel.WARN;
      case "INFO":
        return LogLevel.INFO;
      case "DEBUG":
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : "";
    return `${timestamp} [${level}] ${contextStr} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  log(message: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      // biome-ignore lint/suspicious/noConsole: Logger service is the only allowed place for console usage
      console.log(this.formatMessage("INFO", message));
    }
  }

  error(message: string, trace?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      // biome-ignore lint/suspicious/noConsole: Logger service is the only allowed place for console usage
      console.error(this.formatMessage("ERROR", message));
      if (trace) {
        // biome-ignore lint/suspicious/noConsole: Logger service is the only allowed place for console usage
        console.error(trace);
      }
    }
  }

  warn(message: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      // biome-ignore lint/suspicious/noConsole: Logger service is the only allowed place for console usage
      console.warn(this.formatMessage("WARN", message));
    }
  }

  debug(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // biome-ignore lint/suspicious/noConsole: Logger service is the only allowed place for console usage
      console.debug(this.formatMessage("DEBUG", message));
    }
  }

  verbose(message: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // biome-ignore lint/suspicious/noConsole: Logger service is the only allowed place for console usage
      console.log(this.formatMessage("VERBOSE", message));
    }
  }

  // Set context for this logger instance
  // Call this in your service constructor after injection
  setContext(context: string): void {
    this.context = context;
  }
}
