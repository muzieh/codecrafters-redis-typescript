export function createBulkString(value: string | undefined): string {
  if (value === undefined) {
    return `$-1\r\n`;
  }

  const len = value.length;
  return `$${len}\r\n${value}\r\n`;
}

