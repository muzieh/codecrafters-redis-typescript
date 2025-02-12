import { createBulkString } from "./create-bulk-string.ts";

export function createArray(items: string[]): string {
  return `*${items.length}\r\n${items.map(createBulkString).join("")}`;
}