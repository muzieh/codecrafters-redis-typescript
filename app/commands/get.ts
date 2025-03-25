import { type Store } from "../main.ts";
import { createBulkString } from "../input-parser";

export function getCommand(input: string[], store: Store<string>): string {
  const value = store[input[1]];
  if(!value.expires || (value.expires > new Date())) {
    console.log(`Key ${value} didn't expire`)
    return createBulkString(value.data);
  } else {
    console.log(`Key ${value} has expired`)
    return createBulkString(undefined);
  }
}

