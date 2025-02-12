import type { Store } from "../main.ts";

export function setCommand(input: string[], store: Store<string>): string {

  const key = input[1];
  const data = input[2];
  let expires: Date | undefined = undefined;
  if(input[3] && input[3] === 'px') {
    expires = new Date(Date.now() + parseInt(input[4], 10));
  }
  store[key] = {
    data,
    expires,
  };

  return `+OK\r\n`;
}

