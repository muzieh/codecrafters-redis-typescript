export function infoCommand(result: string[]): string {
  const subcommand = result[1].toUpperCase();
  if(subcommand === "REPLICATION") {
    return `-ERR not implemented\r\n`;
  }
  return `-ERR unknown subcommand\r\n`;
}