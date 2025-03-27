export function psyncCommand(input: string[]): string {
  console.log(`psync ${input}`);
  return "+FULLRESYNC <REPL_ID> 0\r\n";
}

