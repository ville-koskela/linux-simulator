import { mock } from "node:test";
import { Global, Module } from "@nestjs/common";
import { LoggerService } from "./logger.service";

class MockLoggerService implements Partial<LoggerService> {
  public setContext = mock.fn((): void => {
    // Mock - do nothing
  });

  public log = mock.fn((): void => {
    // Mock - do nothing
  });

  public error = mock.fn((): void => {
    // Mock - do nothing
  });

  public warn = mock.fn((): void => {
    // Mock - do nothing
  });

  public debug = mock.fn((): void => {
    // Mock - do nothing
  });

  public verbose = mock.fn((): void => {
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
