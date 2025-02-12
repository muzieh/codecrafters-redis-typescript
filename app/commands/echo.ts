export function echoCommand(input: string[]): string {
  return `+${input[1]}\r\n`;
}