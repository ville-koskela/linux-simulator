import type { CommandResponse } from "@linux-simulator/shared";
import { getAllCommands } from "@linux-simulator/shared";
import { Controller, Get } from "@nestjs/common";

@Controller("commands")
export class CommandsController {
  @Get()
  public getCommands(): CommandResponse {
    return {
      commands: getAllCommands(),
    };
  }
}
