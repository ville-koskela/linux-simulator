import { mock } from "node:test";
import { Global, Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";

class MockLoggerService implements Partial<LoggerService> {
  setContext = mock.fn((): void => {
    // Mock - do nothing
  });

  log = mock.fn((): void => {
    // Mock - do nothing
  });

  error = mock.fn((): void => {
    // Mock - do nothing
  });

  warn = mock.fn((): void => {
    // Mock - do nothing
  });

  debug = mock.fn((): void => {
    // Mock - do nothing
  });

  verbose = mock.fn((): void => {
    // Mock - do nothing
  });
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
