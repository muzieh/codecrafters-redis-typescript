import { type Store } from "../main.ts";
import { createBulkString } from "../input-parser";

export function getCommand(input: string[], store: Store<string>): string {
  const value = store[input[1]];
  if(!value.expires || (value.expires > new Date())) {
    return createBulkString(value.data);
  } else {
    return createBulkString(undefined);
  }
}

