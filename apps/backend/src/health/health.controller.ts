import { Controller, Get } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Needed for dependency injection
import { LoggerService } from "../logger/logger.service";

@Controller("health")
export class HealthController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext("HealthController");
  }

  @Get()
  getHealth() {
    this.logger.debug("Health check requested");
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "linux-simulator-api",
    };
  }
}
