import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { LoggerService } from "../logger/logger.service";
import { MockLoggerModule } from "../logger/logger.module.mock";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MockLoggerModule],
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    assert.ok(controller);
  });

  it("should return ok status", () => {
    const result = controller.getHealth();
    assert.strictEqual(result.status, "ok");
  });

  it("should call logger.debug when health is requested", () => {
    const logger = module.get<LoggerService>(LoggerService);
    
    controller.getHealth();
    
    assert.strictEqual(logger.debug.mock.calls.length, 1);
    assert.strictEqual(
      logger.debug.mock.calls[0].arguments[0],
      "Health check requested"
    );
  });

  it("should call logger.setContext on initialization", () => {
    const logger = module.get<LoggerService>(LoggerService);
    
    assert.strictEqual(logger.setContext.mock.calls.length, 1);
    assert.strictEqual(
      logger.setContext.mock.calls[0].arguments[0],
      "HealthController"
    );
  });
});
