// Terminal command types
export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
}

export interface CommandResponse {
  commands: TerminalCommand[];
}
