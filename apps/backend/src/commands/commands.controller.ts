import type { CommandResponse } from "@linux-simulator/shared";
import { Controller, Get } from "@nestjs/common";

@Controller("commands")
export class CommandsController {
  @Get()
  getCommands(): CommandResponse {
    return {
      commands: [
        {
          name: "echo",
          description: "Display a line of text",
          usage: "echo [text]",
        },
        {
          name: "date",
          description: "Display current date and time",
          usage: "date",
        },
        {
          name: "pwd",
          description: "Print working directory",
          usage: "pwd",
        },
        {
          name: "ls",
          description: "List directory contents",
          usage: "ls [directory]",
        },
        {
          name: "cd",
          description: "Change directory",
          usage: "cd [directory]",
        },
        {
          name: "cat",
          description: "Display file contents",
          usage: "cat <file>",
        },
        {
          name: "mkdir",
          description: "Create a directory",
          usage: "mkdir <directory>",
        },
        {
          name: "touch",
          description: "Create an empty file",
          usage: "touch <file>",
        },
        {
          name: "rm",
          description: "Remove a file or empty directory",
          usage: "rm <file>",
        },
        {
          name: "mv",
          description: "Move or rename a file",
          usage: "mv <source> <destination>",
        },
      ],
    };
  }
}
