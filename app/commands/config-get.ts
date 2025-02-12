import { type Params, type Store } from "../main.ts";
import { createArray } from "../input-parser";

export function configGetCommand(result: string[] , params: Params): string {
  const subcommand = result[1].toUpperCase();

  if(subcommand === "GET") {
    if(result[2] === "dir") {
      return createArray(["dir", params.dir]);
    } else if(result[2] === "dbfilename") {
      return createArray(["dbfilename", params.dbfilename]);
    } else {
      return `-ERR unknown option\r\n`;
    }
  }
  return `-ERR unknown subcommand\r\n`;
}

