import { Global, Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";

// Mock logger service that doesn't output anything and is not transient
class MockLoggerService implements Partial<LoggerService> {
  private context = "";

  setContext(context: string): void {
    this.context = context;
  }

  log(_message: string): void {
    // Mock - do nothing
  }

  error(_message: string, _trace?: string): void {
    // Mock - do nothing
  }

  warn(_message: string): void {
    // Mock - do nothing
  }

  debug(_message: string): void {
    // Mock - do nothing
  }

  verbose(_message: string): void {
    // Mock - do nothing
  }
}

@Global()
@Module({
  providers: [
    {
      provide: LoggerService,
      useClass: MockLoggerService,
    },
  ],
  exports: [LoggerService],
})
export class MockLoggerModule {}
