import { createBulkString } from "../input-parser";

export function replconfCommand(input: string[]): string {
  console.log(`replconf ${input}`);
  return createBulkString("OK");
}

