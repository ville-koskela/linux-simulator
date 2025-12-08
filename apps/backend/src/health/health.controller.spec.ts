import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { Test, type TestingModule } from "@nestjs/testing";
import { MockLoggerModule } from "../logger/logger.module.mock";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
});
