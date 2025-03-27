export function psyncCommand(input: string[]): string {
  console.log(`psync ${input}`);
  const replid = "8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";
  return `+FULLRESYNC ${replid} 0\r\n`;
}

