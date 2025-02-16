import { type Store } from "../main.ts";
import { createArray, createBulkString } from "../input-parser";

export function keysCommand(input: string[], store: Store<string>): string {

  return createArray(Object.keys(store));
}

