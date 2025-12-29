import { Controller, Get, Inject } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";

@Controller("health")
export class HealthController {
  public constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    this.logger.setContext("HealthController");
  }

  @Get()
  public getHealth(): { status: string; timestamp: string; service: string } {
    this.logger.debug("Health check requested");
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "linux-simulator-api",
    };
  }
}
